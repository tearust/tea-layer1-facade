const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToString, u8aToHex } = require('@polkadot/util')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')

var base64 = require('js-base64');

async function main () {
  const api = await ApiPromise.create({
    types,
    rpc
  })

  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })
  const alice = keyring.addFromUri('//Alice', { name: 'Alice default' })

  // how to listen to pair event.
  // method 1 
  // need to start before make pair.
  await api.query.system.events((events) => {
    events.forEach(({ event: { data, method, section }, phase }) => {
      if (section === 'gluon' && method === 'RegistrationApplicationSucceed') {
        console.log("api.query.system.events")
        console.log('\t', phase.toString(), `: ${section}.${method}`)
        console.log('\t','new pair found, app:', u8aToHex(data[0]), "browser:", u8aToHex(data[1]))
      }
    })
  })
  // method 2 
  // if you start before paired, this method is same to method 1.
  // if you start after paired, you still get the pair result.
  const nonePublicKey = '0x0000000000000000000000000000000000000000000000000000000000000000'
  await api.query.gluon.browserAppPair(alice.publicKey, ([appPubKey, metadata])=> {
    if(u8aToHex(appPubKey) !== nonePublicKey) {
      console.log("api.query.gluon.browserAppPair")
      console.log('\t','new pair found, browser:', u8aToHex(appPubKey), "metadata:",base64.decode(u8aToString(metadata)))
    }
  })
}

main()