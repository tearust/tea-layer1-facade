const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')
const BN = require('bn.js')

async function main () {
  const api = await ApiPromise.create({
    types,
    rpc
  })

  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })
  const alice = keyring.addFromUri('//Alice', { name: 'Alice default' })

  // const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
  const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty'

  const yi = new BN('100000000', 10)
  const million = new BN('10000000', 10)
  const unit = yi.mul(million)

  const amount = 100 * unit

  const transfer = api.tx.balances.transfer(BOB, amount.toString())

  // Sign and Send the transaction
  transfer.signAndSend(alice, ({ events = [], status }) => {
    if (status.isInBlock) {
      console.log('Successful transfer of ' + amount + ' with hash ' + status.asInBlock.toHex())
    } else {
      console.log('Status of transfer: ' + status.type)
    }

    events.forEach(({ phase, event: { data, method, section } }) => {
      console.log(phase.toString() + ' : ' + section + '.' + method + ' ' + data.toString())
    })
  })
}

main()
