// const { ApiPromise, Keyring } = require('@polkadot/api')
// const { stringToU8a, u8aToString, u8aToHex, stringToHex } = require('@polkadot/util')
// const { cryptoWaitReady } = require('@polkadot/util-crypto')
// const types = require('../src/types')
// const rpc = require('../src/rpc')

// var base64 = require('js-base64');

// const {runSample, sleep, _} = require('./utils');

// const F = {
//   async getAccountAssets(layer1, account){
//     const api = layer1.getApi();
//     const rs = await api.query.gluon.accountAssets(account.address);

//     return rs.toHuman();
//   },

//   async addTestAsset(layer1, account, key_type, tx_handler){

//     const api = layer1.getApi();
//     const tx = api.tx.gluon.testAddAccountAsset(stringToHex(key_type), stringToHex(key_type+'_test_address'));

//     return await layer1.promisify((cb)=>{
//       tx.signAndSend(account, (param)=>{
//         tx_handler(param, cb);
//       });
//     })
//   },

//   async transferAsset(layer1, account, to_address, tx_handler){
    
//     return await layer1.promisify((cb)=>{
//       const tx = layer1.getApi().tx.gluon.testTransferAllAsset(to_address);
//       tx.signAndSend(account, (param)=>{
//         tx_handler(param, cb);
//       })
//     });
//   },


// };

// runSample(null, async (layer1, handler)=>{
//   const api = layer1.getApi();

//   const alice = layer1.getDefaultAccountByName('Alice');
//   const bob = layer1.getDefaultAccountByName('Bob');
//   const charlie = layer1.getDefaultAccountByName('Charlie');
//   const dave = layer1.getDefaultAccountByName('Dave');

//   const jacky = layer1.getAccountFrom('attend faith multiply expire cancel repair beauty syrup panda provide water weather');
//   const kevin = layer1.getAccountFrom('attend faith multiply expire cancel repair beauty syrup panda provide water where');

//   await layer1.faucet(jacky.address);
//   await sleep(3000);
//   let jacky_ba = await layer1.getBalance(jacky.address);
//   console.log('jacky balance', jacky_ba);


//   let jacky_asset = await F.getAccountAssets(layer1, jacky);
//   console.log('jacky asset', jacky_asset);

//   // add test asset
//   await F.addTestAsset(layer1, jacky, 'dot', handler);
//   await sleep(3000);
  
//   jacky_asset = await F.getAccountAssets(layer1, jacky);
//   console.log('jacky asset', jacky_asset);

//   // transfer asset from jacky to kevin
//   await F.transferAsset(layer1, jacky, kevin.address, handler);
//   await sleep(3000);

//   jacky_asset = await F.getAccountAssets(layer1, jacky);
//   console.log('jacky asset', jacky_asset);
//   jacky_ba = await layer1.getBalance(jacky.address);
//   console.log('jacky balance', jacky_ba);

//   let kevin_asset = await F.getAccountAssets(layer1, kevin);
//   console.log('kevin asset', kevin_asset);
//   kevin_ba = await layer1.getBalance(kevin.address);
//   console.log('kevin balance', kevin_ba);
  
// });
