const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToString, u8aToHex, stringToHex } = require('@polkadot/util')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')

var base64 = require('js-base64');

const {runSample, sleep, _} = require('./utils');

const F = {
  async createRecovery(layer1, account, friend_list, tx_handler){
    const threshold = 2;
    const delay_period = 5;

    return await layer1.promisify((cb)=>{
      const tx = layer1.getApi().tx.recovery.createRecovery(friend_list, threshold, delay_period);
      tx.signAndSend(account, (param)=>{
        tx_handler(param, cb);
      })
    });
  },

  async initiateRecovery(layer1, account, lost_address, tx_handler){
    return await layer1.promisify((cb)=>{
      const tx = layer1.getApi().tx.recovery.initiateRecovery(lost_address);
      tx.signAndSend(account, (param)=>{
        tx_handler(param, cb);
      })
    });
  },

  async vouchRecovery(layer1, account, lost_address, rescuer_address, tx_handler){
    return await layer1.promisify((cb)=>{
      const tx = layer1.getApi().tx.recovery.vouchRecovery(lost_address, rescuer_address);
      tx.signAndSend(account, (param)=>{
        tx_handler(param, cb);
      })
    });
  },

  async claimRecovery(layer1, account, lost_address, tx_handler){
//     const currentBlock = await layer1.getCurrentBlock();
//     const info = await F.getRecoveryInfo(layer1, lost_address, account.address);
// console.log(11, currentBlock, info);
    return await layer1.promisify((cb)=>{
      const tx = layer1.getApi().tx.recovery.claimRecovery(lost_address);
      tx.signAndSend(account, (param)=>{
        tx_handler(param, cb);
      })
    });
  },

  async getRecoveryInfo(layer1, lost_address, rescuer_address){
    const api = layer1.getApi();
    const activeRecoveries_rs = await api.query.recovery.activeRecoveries(lost_address, rescuer_address);
    const recoverable_rs = await api.query.recovery.recoverable(lost_address);

    const recoverable = recoverable_rs.toHuman();
    const activeRecoveries = activeRecoveries_rs.toHuman();

    let can_claim = false;
    if(recoverable && activeRecoveries){
      can_claim = _.size(activeRecoveries.friends) >= recoverable.threshold;
    }
    
    return {
      recoverable,
      activeRecoveries,
      can_claim,
    }
  }

};

runSample(null, async (layer1, handler)=>{
  const api = layer1.getApi();

  const alice = layer1.getDefaultAccountByName('Alice');
  const bob = layer1.getDefaultAccountByName('Bob');
  const charlie = layer1.getDefaultAccountByName('Charlie');
  const dave = layer1.getDefaultAccountByName('Dave');
  const eve = layer1.getDefaultAccountByName('Eve');


  // create recovery for alice, friends are bob, charlie and dave.
  const friend_list = _.sortBy([bob.address, charlie.address, dave.address]);
  console.log('friends list =>', friend_list);
  await F.createRecovery(layer1, alice, friend_list, handler);
  await sleep(3000);

  // assume alice lost, use eve as recovery account.
  await F.initiateRecovery(layer1, eve, alice.address, handler);
  await sleep(3000);

  // bob vouch for alice
  await F.vouchRecovery(layer1, bob, alice.address, eve.address, handler);
  await sleep(3000);

  // charlie vouch for alice
  await F.vouchRecovery(layer1, charlie, alice.address, eve.address, handler);
  await sleep(3000);

  const info = await F.getRecoveryInfo(layer1, alice.address, eve.address);
  console.log(111, info);

  // claim recovery
  await sleep(20000);
  await F.claimRecovery(layer1, eve, alice.address, handler);
  await sleep(3000);

  let x = await api.query.recovery.proxy(eve.address);
  console.log(22, x.toHuman(), alice.address);
  
});
