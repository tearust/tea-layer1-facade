const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToString, u8aToHex, stringToHex } = require('@polkadot/util')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')

var base64 = require('js-base64');

const {runSample, sleep, _} = require('./utils');

const F = {
  async createRecovery(layer1, account, friend_list, tx_handler){
    const threshold = 3;
    const delay_period = 200;

    return await layer1.promisify((cb)=>{
      const tx = layer1.getApi().tx.recovery.createRecovery(friend_list, threshold, delay_period);
      tx.signAndSend(account, (param)=>{
        tx_handler(param, cb);
      })
    });
  }

};

runSample(null, async (layer1, handler)=>{
  const api = layer1.getApi();

  const alice = layer1.getDefaultAccountByName('Alice');
  const bob = layer1.getDefaultAccountByName('Bob');
  const charlie = layer1.getDefaultAccountByName('Charlie');
  const dave = layer1.getDefaultAccountByName('Dave');

  // console.log(api.tx.recovery);

  // create recovery
  const friend_list = [bob.address, charlie.address, dave.address];
  await F.createRecovery(layer1, alice, friend_list, handler);
  await sleep(3000);
  
});
