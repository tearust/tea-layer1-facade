const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToString, u8aToHex, stringToHex } = require('@polkadot/util')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')

var base64 = require('js-base64');

const {runSample, sleep, _} = require('./utils');
// TODO
const F = {
  async addToAddressBook(layer1, account, target_address, tx_handler){
    console.log(111);
    return await layer1.promisify((cb)=>{
      const tx = layer1.getApi().tx.technicalMembership.addMember(target_address);
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
  const eve = layer1.getDefaultAccountByName('Eve');

  // console.log(api.tx.technicalMembership);

  await F.addToAddressBook(layer1, alice, eve.address, handler);
  // await sleep(3000);
  
});
