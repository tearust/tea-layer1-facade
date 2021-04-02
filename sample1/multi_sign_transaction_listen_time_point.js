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
const index = 2;

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

  await api.query.system.events((events) => {
    events.forEach(({ event: { data, method, section }, phase }) => {
      if (section === 'multisig' && method === 'NewMultisig') {
        console.log("api.query.system.events");
        const who = encodeAddress(data[0].toHex());
        const id =  encodeAddress(data[1].toHex());
        const call_hash = u8aToHex(data[2]);
        console.log('\t', phase.toString(), `: ${section}.${method}`);
        console.log('\t','New multisig, who:', who, "id:", id, "call_hash:", call_hash);
      }
    })
  });

  // then we can use id and call_hash to get TimePoint and send approve
  // multisig transaction (sample in multi_sign_transaction_approve.js)
}

main()
