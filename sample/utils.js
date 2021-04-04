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
      return _.get(ERRORS, type_index+'.'+err, 'Not Found in Error definination');
    }

    return null;
  }
};

exports._ = _;

const sleep = exports.sleep = (time)=>{
  return new Promise((resolve) => setTimeout(resolve, time))
}

exports.runSample = async (name, fn)=>{
  name = name || _.last(process.argv[1].split('/'));
  console.log('----- sample ['+name+'] start -----');
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

  }

  console.log('----- sample ['+name+'] end -----');
  process.exit(0);
}