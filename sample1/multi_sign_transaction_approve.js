const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const { stringToU8a, u8aToHex } = require('@polkadot/util')
const types = require('../src/types')
const rpc = require('../src/rpc')
const BN = require('bn.js')

const {createKeyMulti, encodeAddress, decodeAddress, sortAddresses} = require('@polkadot/util-crypto')

const SS58Prefix = 0;

// Input the addresses that will make up the multisig account.
const addresses = [ // get by [owner].address
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', //Alice
  '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', //Bob
  '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y' //Charlie
];

// The number of accounts that must approve. Must be greater than 0 and less than
// or equal to the total number of addresses.
const threshold = 2;

// The address (as index in `addresses`) that will submit a transaction.
// bob
const index = 1;

async function main () {
  const api = await ApiPromise.create({
    types,
    rpc
  })

  await cryptoWaitReady()

  const yi = new BN('100000000', 10)
  const million = new BN('10000000', 10)
  const unit = yi.mul(million)

  // Address as a byte array.
  const multiAddress = createKeyMulti(addresses, threshold);
  // Convert byte array to SS58 encoding.
  const Ss58Address = encodeAddress(multiAddress, SS58Prefix);
  console.log(`\nMultisig Address: ${Ss58Address}`);
  // Take addresses and remove the sender.
  const otherSignatories = addresses.filter((who) => who !== addresses[index]);
  // Sort them by public key.
  const otherSignatoriesSorted = sortAddresses(otherSignatories, SS58Prefix);
  console.log(`\nOther Signatories: ${otherSignatoriesSorted}\n`);

  const keyring = new Keyring({ type: 'sr25519' })
  const bob = keyring.addFromUri('//Bob', { name: 'Alice default' })
  const charlie = keyring.addFromUri('//Charlie', { name: 'Alice default' })

  // get TimePoint from multisig pallet:(sample in multi_sign_transaction_get_time_point.js)
  const id = '5DjYJStmdZ2rcqXbXGX7TW85JsrW6uG4y9MUcLq2BoPMpRA7';
  const call_hash = '0xd7355881aab269cc469314240cb6d061119ae5265300bb6475123b6e756b791f';

  const op_multisig = await api.query.multisig.multisigs(id, call_hash);
  console.log('multisig:', op_multisig.toString());
  if (op_multisig.isSome) {
    const multisig = op_multisig.unwrap();
    console.log('\t', 'multisig:', multisig.toString());
    console.log('\t', 'multisig TimePoint:', multisig.when.toString());
    const time_point = multisig.when;
    // send approve transaction (last one need to use 'asMulti')
    const weight = 230161000;
    const amount2 = 10 * unit;
    const transfer2 = api.tx.balances.transfer(charlie.address, amount2.toString()).method.toHex()
    api.tx.multisig.asMulti(
        threshold,
        otherSignatoriesSorted,
        time_point,
        transfer2,
        false,
        weight)
        .signAndSend(bob, ({events = [], status}) => {
          if (status.isInBlock) {
            console.log('Included at block hash', status.asInBlock.toHex());
            console.log('Events:');
            events.forEach(({event: {data, method, section}, phase}) => {
              console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString())
            })
          } else if (status.isFinalized) {
            console.log('Finalized block hash', status.asFinalized.toHex())
          }
        });
  }
  console.log('send tx')
}

main()
