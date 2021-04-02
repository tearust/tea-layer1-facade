const { ApiPromise, Keyring, WsProvider } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')
const BN = require('bn.js')

const Layer1 = exports.Layer1 = class {
  constructor(){
    this.api = null;
  }

  async init(){
    const wsProvider = new WsProvider('ws://127.0.0.1:9944');

    this.api = await ApiPromise.create({
      provider: wsProvider,
      types,
      rpc
    });

    await cryptoWaitReady();
  }

  getApi(){
    return this.api;
  }

  getDefaultAccountByName(name="Alice"){
    const keyring = new Keyring({ type: 'sr25519' })

    const account = '//'+name;
    const ac = keyring.addFromUri(account);

    // console.log('Use default account =>', ac);
    return ac;
  }
};

exports.runSample = async (name, fn)=>{
  console.log('----- sample ['+name+'] start -----');
  const layer1 = new Layer1();
  await layer1.init();

  try{
    await fn(layer1);
  }catch(e){
    console.error(e);
  }
  
  console.log('----- sample ['+name+'] end -----');
  process.exit(0);
}