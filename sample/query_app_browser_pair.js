const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToString, u8aToHex } = require('@polkadot/util')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')

var base64 = require('js-base64');

const {runSample} = require('./utils');

runSample(null, async (layer1)=>{
  const api = layer1.getApi();

  const alice = layer1.getDefaultAccountByName('Alice');
  const bob = layer1.getDefaultAccountByName('Bob');

  const app = await api.query.gluon.browserAppPair(alice.publicKey);
  console.log('query gluon.BrowserAppPair app:', u8aToHex(app[0]), "metadata:", base64.decode(u8aToString(app[1])));

  const browser = await api.query.gluon.appBrowserPair(bob.publicKey);
  console.log('query gluon.AppBrowserPair browser:', u8aToHex(browser[0]), "metadata:",base64.decode(u8aToString(browser[1])));
});
