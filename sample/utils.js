const { ApiPromise, Keyring, WsProvider } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const { stringToU8a, u8aToString, u8aToHex, stringToHex, promisify } = require('@polkadot/util')
const types = require('../src/types')
const rpc = require('../src/rpc')
const BN = require('bn.js')
const _ = require('lodash');
const ERRORS = require('../src/error');

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

  getAccountFrom(mn){
    const keyring = new Keyring({ type: 'sr25519' })
    const ac = keyring.addFromUri(mn);
    return ac;
  }

  asUnit(){
    const yi = new BN('100000000', 10);
    const million = new BN('10000000', 10);
    const unit = yi.mul(million);

    return unit;
  }

  async faucet(target_address){
    const da = this.getDefaultAccountByName('Ferdie');
    const total = new BN((1000*this.asUnit()).toString(), 10);
    const transfer = this.api.tx.balances.transfer(target_address, total);

    return new Promise((resolve)=>{
      transfer.signAndSend(da, (result) => {
        console.log(`Current status is ${result.status}`);
  
        if (result.status.isInBlock) {
          console.log(`Transaction included at blockHash ${result.status.asInBlock}`);
          result.events.forEach(({ event: { data, method, section }, phase }) => {
            console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
          });
        } else if (result.status.isFinalized) {
          console.log(`Transaction finalized at blockHash ${result.status.asFinalized}`);
          resolve(true);
        }
      });
    });
    
  }

  getApi(){
    return this.api;
  }

  getCurrentBlock(){
    return new Promise((resolve)=>{
      this.api.rpc.chain.subscribeNewHeads((header) => {
        resolve(header);
      })
    });
  }

  async getBalance(account){
    let { data: { free: previousFree }, nonce: previousNonce } = await this.api.query.system.account(account);

    return parseInt(previousFree.toString(), 10);
  }

  getDefaultAccountByName(name="Alice"){
    const keyring = new Keyring({ type: 'sr25519' })

    const account = '//'+name;
    const ac = keyring.addFromUri(account);

    // console.log('Use default account =>', ac);
    return ac;
  }

  async promisify(fn) {
    return promisify(this, async (cb) => {
      try {
        await fn(cb);
      } catch (e) {
        cb(e.toString());
      }
    });
  }

  _transactionCallback(param, cb) {
    const {events = [], status} = param;
    if (status.isInBlock) {
      console.log('Included at block hash', status.asInBlock.toHex());
      console.log('Events:');

      const opts = {};
      events.forEach(({event: {data, method, section}, phase}) => {
        console.log(
          '\t',
          phase.toString(),
          `: ${section}.${method}`,
          data.toString(),
        );
        if (method === 'ExtrinsicFailed') {
          const error = this._findError(data);
          if (error) {
            cb(error);
            return;
          }
          opts.data = data;
        }
      });

      cb(null, opts);
    } else if (status.isFinalized) {
      console.log('Finalized block hash', status.asFinalized.toHex());
    }
  }
  _findError(data) {
    let err = false;
    let type_index = -1;
    _.each(data.toJSON(), (p) => {
      if (!_.isUndefined(_.get(p, 'Module.error'))) {
        err = _.get(p, 'Module.error');
        type_index = _.get(p, 'Module.index');
        return false;
      }
    });

    if (err !== false) {
      return _.get(ERRORS, type_index+'.'+err, 'Not Found in Error definination with [index: '+type_index+', error: '+err+']');
    }

    return null;
  }
};

exports._ = _;

const sleep = exports.sleep = (time)=>{
  return new Promise((resolve) => setTimeout(resolve, time))
}

exports.runSample = async (name, fn, type="layer1")=>{
  name = name || _.last(process.argv[1].split('/'));
  console.log('----- sample ['+name+'] start -----');

  if(type === 'layer1'){
    const layer1 = new Layer1();
    await layer1.init();

    try{
      await fn(layer1, (param, cb)=>{
        layer1._transactionCallback(param, (err, data)=>{
          if(err){
            console.error(`TX ERROR => ${err}`);
            cb(err);
          }
          else{
            cb(null, data);
          }
    
        });
    
      });
    }catch(e){
      console.error(e);
    }
  }
  else if(type === 'rpc'){
    try{
      await fn();
    }catch(e){
      console.error('[RPC]', e);
    }
  }

  
  console.log('----- sample ['+name+'] end -----');
  process.exit(0);
}

