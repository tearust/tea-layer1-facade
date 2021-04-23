const {_} = require('tearust_utils');
const {Layer1, helper} = require('tearust_layer1');

const rpcserver = require('./jsonrpc/server');
const rpcclient = require('./jsonrpc/client');

const RPC_HTTP_CLIENT_URL = process.env.RPC_HTTP_URL || 'http://127.0.0.1:5012';
const RPC_HTTP_SERVER_PORT = process.env.RPC_HTTP_SERVER_PORT || 5013;
const LAYER1_URL = process.env.FACADE_WSURL || 'ws://127.0.0.1:9944';

const Facade = class {
  constructor() {
    this.rpc_server = null;
    this.rpc_client = null;

    this.layer1 = null;
    this.current_layer1_account = null;
  }

  async init() {
    await this.initLayer1();
    console.log('Layer1 start');

    await this.initJsonRpc();
  }

  async initLayer1() {
    this.layer1 = new Layer1({
      ws_url: LAYER1_URL,
      env: 'node',
    });
    await this.layer1.init();

    this.initLayer1Event();

    const default_account = process.env.FACADE_ACCOUNT_URI || 'Alice';
    this.current_layer1_account = this.layer1.getAccountFrom(default_account);
    const balance = await this.layer1.getRealAccountBalance(this.current_layer1_account.address);

    console.log(`facade use account: ${this.current_layer1_account.address} | ${balance}`)
  }

  async initJsonRpc() {
    this.rpc_server = new rpcserver(this.layer1, this.current_layer1_account);
    await this.rpc_server.init(RPC_HTTP_SERVER_PORT);

    this.rpc_client = new rpcclient({
      http_url: RPC_HTTP_CLIENT_URL,
    });
  }

  initLayer1Event() {
    // NewNodeJoined
    this.layer1.buildCallback('tea.NewNodeJoined', (data, event) => {
      console.log('tea.NewNodeJoined =>', data.toHuman())
      const nodeAddedEvent = {
        accountId: data[0].toString(),
        teaId: Buffer.from(data[1].teaId, 'hex').toString('base64')
      };
      console.log('send event: ', nodeAddedEvent);
      this.rpc_client.call("newNodeJoined", [nodeAddedEvent]);
    });
  }
};

async function run() {
  console.log('--------- start facade ----------');
  const o = new Facade();
  await o.init();


};

run().catch((e) => {
  console.error('[ERROR]', e);
  process.exit(-1);
})
