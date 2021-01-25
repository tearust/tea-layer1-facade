const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToHex } = require('@polkadot/util')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
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
  const bob = keyring.addFromUri('//Bob', { name: 'Bob default' })

  const nonce = '100'
  const nonce2 = '200'
  const delegator_nonce_hash = u8aToHex(Buffer.from(hash(nonce2), 'hex'))
  // todo use real rsa
  const delegator_nonce_rsa = u8aToHex(Buffer.from('24d614bd215f1c90345a4b505be6bd0589ac6b105a2a8c059a5890ba953aec11', 'hex'))
  const key_type = 'btc'
  // todo use real p1
  const p1 = u8aToHex(Buffer.from('24d614bd215f1c90345a4b505be6bd0589ac6b105a2a8c059a5890ba953aec11', 'hex'))
  const p2_n = 3;
  const p2_k = 2;

  console.log("key_type:", key_type)
  console.log("p2_n:", p2_n)
  console.log("p2_k:", p2_k)
  console.log("delegator_nonce_hash:", delegator_nonce_hash)
  console.log("delegator_nonce_rsa:", delegator_nonce_rsa)
  console.log("p1:", p1)

  // need to get task from browser-sign-transaction result
  const task_id = '0x6de524f32772894873578ac6d786a5e82738ffdbadc307dfc038feb0ff4f7536';
  const p1_signature = u8aToHex(stringToU8a('testSignature'));;
  const multi_sig_account = u8aToHex(stringToU8a('testAddress'));

  await api.tx.gluon.updateP1Signature(task_id, multi_sig_account, p1_signature )
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