const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const { stringToU8a, u8aToHex } = require('@polkadot/util')
const types = require('../src/types')
const rpc = require('../src/rpc')

async function main () {
  const api = await ApiPromise.create({
    types,
    rpc
  })

  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })
  const alice = keyring.addFromUri('//Alice', { name: 'Alice default' })

  const nonce = 100
  const nonce_hash = Buffer.from('ad57366865126e55649ecb23ae1d48887544976efea46a48eb5d85a6eeb4d306', 'hex')
  const task_hash = Buffer.from('51c572c127f49884ebb0a24b1877796f8bfc09c462e57475327cf9ae355697f6', 'hex')
  await api.tx.gluon.browserGenerateAccount(u8aToHex(nonce_hash), u8aToHex(task_hash))
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

  console.log('send browser_generate_account tx')
}

main()
