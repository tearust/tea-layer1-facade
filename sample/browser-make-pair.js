const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const { stringToU8a, u8aToHex } = require('@polkadot/util')
const types = require('../src/types')
const rpc = require('../src/rpc')

// you need to 'npm install js-sha256'
var hash = require('js-sha256');

async function main () {
  const api = await ApiPromise.create({
    types,
    rpc
  })

  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })

  // sample to get address from public key and get public key from address
  const addr = keyring.encodeAddress('0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d')
  console.log("addr:", addr)
  const pk = keyring.decodeAddress('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')
  console.log("pk:", u8aToHex(pk))


  const alice = keyring.addFromUri('//Alice', { name: 'Alice default' })

  const nonce = '100'
  const nonce_hash = hash(nonce)
  console.log("nonce_hash:", nonce_hash)
  const nonce_hash_hex = u8aToHex(Buffer.from(nonce_hash, 'hex'))
  await api.tx.gluon.browserSendNonce(nonce_hash_hex)
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

  console.log('send nonce tx')
}

main()
