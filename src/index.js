
const {_} = require('tearust_utils');
const {Layer1, helper} = require('tearust_layer1');

const rpcserver = require('./jsonrpc/server');
const rpcclient = require('./jsonrpc/client');

const RPC_HTTP_URL = process.env.RPC_HTTP_URL || 'http://127.0.0.1:3330';
const LAYER1_URL = process.env.FACADE_WSURL || 'ws://127.0.0.1:9944';

const Facade = class {
  constructor(){
    this.rpc_server = null;
    this.rpc_client = null;

    this.layer1 = null;
    this.current_layer1_account = null;
  }
  async init(){
    await this.initLayer1();
    console.log('Layer1 start');

    await this.initJsonRpc();
  }

  async initLayer1(){
    this.layer1 = new Layer1({
      ws_url: LAYER1_URL,
      env: 'node',
    });
    await this.layer1.init();

    const default_account = process.env.FACADE_ACCOUNT_URI || '//Alice';
    this.current_layer1_account = this.layer1.getAccountFrom(default_account);

    console.log(`facade use account: ${this.current_layer1_account.address}`)
  }

  async initJsonRpc(){
    this.rpc_server = new rpcserver(this.layer1, this.current_layer1_account);
    await this.rpc_server.init();

    this.rpc_client = new rpcclient({
      http_url: RPC_HTTP_URL,
    });
  }
};

async function run(){
  console.log('--------- start facade ----------');
  const o = new Facade();
  await o.init();

  
};

run().catch((e)=>{
  console.error('[ERROR]', e);
  process.exit(-1);
})