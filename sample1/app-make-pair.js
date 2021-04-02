const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToHex } = require('@polkadot/util')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')
const base64 = require("js-base64")

async function main () {
  const api = await ApiPromise.create({
    types,
    rpc
  })

  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })
  const alice = keyring.addFromUri('//Alice', { name: 'Alice default' })
  const bob = keyring.addFromUri('//Bob', { name: 'Bob default' })

  const nonce = '100'
  const metadata = base64.encode('test metadata')
  await api.tx.gluon.sendRegistrationApplication(nonce, u8aToHex(alice.publicKey), metadata)
      .signAndSend(bob, ({ events = [], status }) => {
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

  console.log('send nonce tx')
}

main()