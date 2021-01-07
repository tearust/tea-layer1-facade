const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToHex } = require('@polkadot/util')
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
  const bob = keyring.addFromUri('//Bob', { name: 'Bob default' })

  const nonce = '100'
  const message = stringToU8a('100')
  const nonceSignature = bob.sign(message)
  const message2 = stringToU8a('200')
  const delegator_nonce_hash = u8aToHex(bob.sign(message2))
  const delegator_nonce_rsa = u8aToHex("testdelegatornonce")
  const key_type = u8aToHex("btc")
  const p1 = u8aToHex("testp1btc")
  const p2_n = 3
  const p2_k = 2
  await api.tx.gluon.generateAccountWithoutP3(nonce, u8aToHex(nonceSignature),
      delegator_nonce_hash, delegator_nonce_rsa, key_type, p1, p2_n, p2_k, u8aToHex(alice.publicKey))
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