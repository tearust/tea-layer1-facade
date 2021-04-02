const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')
const BN = require('bn.js')

const yi = new BN('100000000', 10)
const million = new BN('10000000', 10)
const unit = yi.mul(million)

async function main () {
  const api = await ApiPromise.create({
    types,
    rpc
  })

  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })
  const alice = keyring.addFromUri('//Alice', { name: 'Alice default' })

  const delegatorEphemeralId = '0x421f50f4c91e66d0c2c18ccfdbef9480741a3c7eb189fc45a2e18ae3ee1b185f'
  const depositPubkey = '0x889c1a57859860e18d0bd6b6488e601570dce7c06eee30cb98a63102f09972a4'
  const delegatorSignature = '0x808641dc76cae1353aa6e74e7c9275266c6c773f3b7c4271a72f70970adf317de54df11adf2d11037598f44ca27f5b4276991a4ec5a14d6b6716aae7e728a60c'
  const amount = 100 * unit
  const expireTime = 50

  await api.tx.tea.deposit(delegatorEphemeralId, depositPubkey, delegatorSignature, amount.toString(), expireTime)
    .signAndSend(alice, ({ events = [], status }) => {
      if (status.isInBlock) {
        console.log('Included at block hash', status.asInBlock.toHex())
        console.log('Events:')
        events.forEach(({ event: { data, method, section }, phase }) => {
          console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString())
        })
      } else if (status.isFinalized) {
        console.log('Finalized block hash', status.asFinalized.toHex())
      }
    })

  console.log('send deposit tx')
}

main()
