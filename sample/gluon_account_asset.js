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
  
  const rs = await api.query.gluon.accountAssets(alice.address);

  console.log(rs.toHuman())
});
