const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')
const BN = require('bn.js')

const {createKeyMulti, encodeAddress, sortAddresses} = require('@polkadot/util-crypto')

const SS58Prefix = 0;

// Input the addresses that will make up the multisig account.
const addresses = [
  '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', //Alice
  '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', //Bob
  '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y' //Charlie
];

// The number of accounts that must approve. Must be greater than 0 and less than
// or equal to the total number of addresses.
const threshold = 2;

// The address (as index in `addresses`) that will submit a transaction.
const index = 0;

async function main () {
  const api = await ApiPromise.create({
    types,
    rpc,

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
  const alice = keyring.addFromUri('//Alice', { name: 'Alice default' })
  const nonce = await api.rpc.system.accountNextIndex(alice.address);

  // Transfer 100 Unit, one unit = 1e15
  // simple usage:
  // const amount = 100 * 1e15
  const amount = 100 * unit
  // Create a extrinsic, transferring randomAmount units to Bob.
  const transfer = api.tx.balances.transfer(Ss58Address, amount.toString())
  const unsub = await transfer.signAndSend(alice,{ nonce: nonce }, ({ events = [], status }) => {
    if (status.isInBlock) {
      console.log('tx1: Successful transfer of ' + amount + ' with hash ' + status.asInBlock.toHex())
      unsub()
    } else {
      console.log('tx1: Status of transfer: ' + status.type)
    }

    events.forEach(({ phase, event: { data, method, section } }) => {
      console.log('tx1:' + phase.toString() + ' : ' + section + '.' + method + ' ' + data.toString())
    })
  })
  console.log('send tx1 with nonce:', nonce)
  const nonce2 = await api.rpc.system.accountNextIndex(alice.address);
  const unsub2 = await transfer.signAndSend(alice, { nonce: nonce2 },({ events = [], status }) => {
    if (status.isInBlock) {
      console.log('tx2: Successful transfer of ' + amount + ' with hash ' + status.asInBlock.toHex())
      unsub2()
    } else {
      console.log('tx2: Status of transfer: ' + status.type)
    }

    events.forEach(({ phase, event: { data, method, section } }) => {
      console.log('tx2:' + phase.toString() + ' : ' + section + '.' + method + ' ' + data.toString())
    })
  })
  console.log('send tx2 with nonce:', nonce2)

}

main()
