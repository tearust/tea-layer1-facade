const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToString, u8aToHex, stringToHex } = require('@polkadot/util')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')

var base64 = require('js-base64');

const {runSample} = require('./utils');

runSample(null, async (layer1, handler)=>{
  const api = layer1.getApi();

  const alice = layer1.getDefaultAccountByName('Alice');
  
  const tx = api.tx.gluon.testAddAccountAsset(alice.address, stringToHex('dot'), stringToHex('test_address_b58'));

  await layer1.promisify((cb)=>{
    tx.signAndSend(alice, (param)=>{
      handler(param, cb);
    });
  })

  const rs = await api.query.gluon.accountAssets(alice.address);
  console.log(rs.toHuman())
});
