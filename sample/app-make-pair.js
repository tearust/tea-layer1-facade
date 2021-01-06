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

  // const nonce = 100
  // const nonce_hash = '18ac3e7343f016890c510e93f935261169d9e3f565436429830faf0934f4f8e4'
  // const message = stringToU8a('100');
  // const signature = bob.sign(message);
  // await api.tx.gluon.sendRegistrationApplication(message.toString(), signature.toString(), alice.publicKey.toString())
  const nonce = '100'
  const nonceSignature = '0a1440036a457fd023ceac9e7287c8313ad50eff73cf74341e38f843a7a04ddc5be8178f5796bb756ed000e05ee35e19b602cccb95872c6756255ab4c5a91900'
  const browserPk = '0xdf38cb4f12479041c8e8d238109ef2a150b017f382206e24fee932e637c2db7b'
  await api.tx.gluon.sendRegistrationApplication(nonce, nonceSignature, browserPk)
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