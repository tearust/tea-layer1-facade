const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToString, u8aToHex } = require('@polkadot/util')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')
const query = require('../src/query')

var base64 = require('js-base64');

async function main () {
  const api = await ApiPromise.create({
    types,
    rpc
  })

  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' })
  const bob = keyring.addFromUri('//Bob', { name: 'Alice default' })

  const browser = await api.query.gluon.appBrowserPair(bob.publicKey)
  console.log('query gluon.AppBrowserPair browser:', u8aToHex(browser[0]), "metadata:",base64.decode(u8aToString(browser[1])))
}

main()