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
  const alice = keyring.addFromUri('//Alice', { name: 'Alice default' })

  const nonce2 = '200'
  const delegator_nonce_hash = u8aToHex(Buffer.from(hash(nonce2), 'hex'))
  // todo use real rsa
  const delegator_nonce_rsa = u8aToHex(Buffer.from('24d614bd215f1c90345a4b505be6bd0589ac6b105a2a8c059a5890ba953aec11', 'hex'))
  const key_type = 'btc'
  // todo use real p1
  const p1 = u8aToHex(Buffer.from('24d614bd215f1c90345a4b505be6bd0589ac6b105a2a8c059a5890ba953aec11', 'hex'))
  const p2_n = 3
  const p2_k = 20
  console.log("key_type:", key_type)
  console.log("p2_n:", p2_n)
  console.log("p2_k:", p2_k)
  console.log("delegator_nonce_hash:", delegator_nonce_hash)
  console.log("delegator_nonce_rsa:", delegator_nonce_rsa)
  console.log("p1:", p1)

  const task =  {
      keyType: key_type,
      n: p2_n,
      k: p2_k,
      delegatorNonceHash: delegator_nonce_hash,
      delegatorNonceRsa: delegator_nonce_rsa,
      p1: p1,
  };
  const task_hash = hash(task.toString())
    console.log("task_hash:", task_hash)

  const nonce = '100'
  const nonce_hash = hash(nonce)
  console.log("nonce_hash:", nonce_hash)
  const nonce_hash_hex = u8aToHex(Buffer.from(nonce_hash, 'hex'))
  const task_hash_hex = u8aToHex(Buffer.from(task_hash, 'hex'))
  await api.tx.gluon.browserGenerateAccount(nonce_hash_hex, task_hash_hex)
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
