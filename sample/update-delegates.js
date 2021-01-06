const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
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

  await api.tx.gluon.updateDelegator()
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
