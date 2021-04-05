const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToString, u8aToHex, stringToHex } = require('@polkadot/util')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')

var base64 = require('js-base64');

const {runSample, sleep, _} = require('./utils');

const F = {
  async getAccountAssets(layer1, account){
    const api = layer1.getApi();
    const rs = await api.query.gluon.accountAssets(account.address);

    return rs.toHuman();
  },

  async addTestAsset(layer1, account, target_address, key_type, tx_handler){
    const api = layer1.getApi();
    const tx = api.tx.gluon.testAddAccountAsset(target_address, stringToHex(key_type), stringToHex(key_type+'_test_address'));

    return await layer1.promisify((cb)=>{
      tx.signAndSend(account, (param)=>{
        tx_handler(param, cb);
      });
    })
  },

  async transferAsset(layer1, account, from_address, to_address, tx_handler){
    return await layer1.promisify((cb)=>{
      const tx = layer1.getApi().tx.gluon.transferAsset(from_address, to_address);
      tx.signAndSend(account, (param)=>{
        tx_handler(param, cb);
      })
    });
  },

};

runSample(null, async (layer1, handler)=>{
  const api = layer1.getApi();

  const alice = layer1.getDefaultAccountByName('Alice');
  const bob = layer1.getDefaultAccountByName('Bob');
  const charlie = layer1.getDefaultAccountByName('Charlie');
  const dave = layer1.getDefaultAccountByName('Dave');

  let alice_asset = await F.getAccountAssets(layer1, alice);
  console.log('Alice asset', alice_asset);

  // add test asset
  await F.addTestAsset(layer1, alice, alice.address, 'dot', handler);
  await sleep(3000);
  
  alice_asset = await F.getAccountAssets(layer1, alice);
  console.log('Alice asset', alice_asset);


  // transfer asset from alict to bob
  // await F.transferAsset(layer1, alice, alice.address, bob.address, handler);
  // await sleep(3000);

  // alice_asset = await F.getAccountAssets(layer1, alice);
  // console.log('Alice asset', alice_asset);

  // let bob_asset = await F.getAccountAssets(layer1, bob);
  // console.log('Bob asset', bob_asset);
  
});
