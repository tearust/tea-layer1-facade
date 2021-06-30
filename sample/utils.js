
const {_} = require('tearust_utils');
const {Layer1} = require('tearust_layer1');
const chalk = require('chalk');
const axios = require('axios');

const client = require('../src/jsonrpc/client');
const types = require('../res/types.json');

exports._ = _;

const sleep = exports.sleep = (time)=>{
  return new Promise((resolve) => setTimeout(resolve, time))
}

const _aseert = {
  Y: 0, N: 0,
};
exports.assert = (condition_left, condition_right, error)=>{
  
  if(condition_left !== condition_right){
    _aseert.N++;
    console.log(chalk.red('[assert failed] => '+error.toString()));
    console.log(chalk.red(`Left: ${condition_left} | Right: ${condition_right}`));
  }
  else{
    _aseert.Y++
  }
};

const LAYER1_RPC = 'http://127.0.0.1:9933';
exports.layer1_rpc = async (method, params=[])=>{
  const data = {
    jsonrpc: '2.0',
    method,
    params,
    id: 9999
  };
  const rs = await axios.post(LAYER1_RPC, data, {
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if(rs.data.id === 9999){
    return rs.data.result;
  }

  return null;
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

      console.log(chalk.cyan(`----- Test result -----`));
      console.log(chalk.green(`Y => ${_aseert.Y}`));
      console.log(chalk.red(`N => ${_aseert.N}`));
    }catch(e){
      console.log(chalk.red('[LAYER1]', e));
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

