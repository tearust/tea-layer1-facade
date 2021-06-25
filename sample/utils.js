
const {_} = require('tearust_utils');
const {Layer1} = require('tearust_layer1');

const client = require('../src/jsonrpc/client');
const types = require('../res/types.json');

exports._ = _;

const sleep = exports.sleep = (time)=>{
  return new Promise((resolve) => setTimeout(resolve, time))
}

exports.runSample = async (name, fn, type="layer1")=>{
  name = name || _.last(process.argv[1].split('/'));
  console.log('----- sample ['+name+'] start -----');

  if(type === 'layer1'){
    const layer1 = new Layer1({
      ws_url: 'ws://127.0.0.1:9944',
      env: 'node',
      system_top_up_account: 'Alice',
      types,
    });
    await layer1.init();

    try{
      await fn(layer1);
    }catch(e){
      console.error('[LAYER1]', e);
    }
    
  }
  else if(type === 'rpc'){
    try{
      const c = new client({
        http_url: 'http://localhost:3330',
      });
      await fn(c);
    }catch(e){
      console.error('[RPC]', e);
    }
  }

  
  console.log('----- sample ['+name+'] end -----');
  process.exit(0);
}

