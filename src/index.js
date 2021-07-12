
const {Layer1, helper, hexToString} = require('tearust_layer1');
const {_} = require('tearust_utils');
const rpcserver = require('./jsonrpc/server');
const rpcclient = require('./jsonrpc/client');
const types = require('../res/types.json');
const chalk = require('chalk');
const axios = require('axios');

const {sleep} = require('../sample/utils');


const LAYER1_URL = process.env.LAYER1_URL || 'ws://127.0.0.1:9944';
const LAYER1_RPC = process.env.LAYER1_RPC || 'ws://127.0.0.1:9933';

// share account
const ACCOUNT_URI = process.env.ACCOUNT_URI || 'runway where sponsor visual reject drill dwarf tired wild flag monitor test';

const DUMMY_RA_TIME = process.env.DUMMY_RA_TIME || 6000;

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

    // await this.initJsonRpc();

    await this.initDummyRaTx();
  }

  async initLayer1() {
    this.layer1 = new Layer1({
      ws_url: LAYER1_URL,
      types,

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
    // this.layer1.buildCallback('tea.NewNodeJoined', (data, event) => {
    //   console.log('tea.NewNodeJoined =>', data.toHuman());
    //   const nodeAddedEvent = {
    //     accountId: data[0].toString(),
    //     teaId: Buffer.from(data[1].teaId, 'hex').toString('base64')
    //   };
    //   console.log('send event: ', nodeAddedEvent);
    //   this.rpc_client.call("newNodeJoined", [nodeAddedEvent]);
    // });

    // this.layer1.buildCallback('tea.UpdateNodeProfile', (data, event) => {
    //   console.log('tea.UpdateNodeProfile =>', data.toHuman());
    //   const urls = [];
    //   if (data[1]['urls']) {
    //     data[1]['urls'].forEach((url, i) => {
    //       urls.push(Buffer.from(url, 'hex').toString())
    //     })
    //   }
    //   const raNodes = []
    //   if (data[1]['raNodes']) {
    //     data[1]['raNodes'].forEach((raNode, i) => {
    //       raNodes.push({
    //         teaId: Buffer.from(raNode[0], 'hex').toString('base64'),
    //         isPass: Boolean(raNode[1])
    //       })
    //     })
    //   }
    //   const updateNodeProfileEvent = {
    //     accountId: data[0].toString(),
    //     ephemeralPublicKey: Buffer.from(data[1]['ephemeralId'], 'hex').toString('base64'),
    //     profileCid: Buffer.from(data[1]['profileCid'], 'hex').toString(),
    //     teaId: Buffer.from(data[1]['teaId'], 'hex').toString('base64'),
    //     publicUrls: urls,
    //     peerId: Buffer.from(data[1]['peerId'], 'hex').toString(),
    //     raNodes: raNodes,
    //     status: data[1]['status'].toString(),
    //   };
    //   console.log('send event: ', updateNodeProfileEvent);
    //   this.rpc_client.call("updateNodeProfile", [updateNodeProfileEvent]);
    // });

    // this.layer1.buildCallback('tea.CommitRaResult', (data, event) => {
    //   console.log('tea.CommitRaResult =>', data.toHuman());

    //   const commitRaResultEvent = {
    //     accountId: data[0].toString(),
    //     teaId: Buffer.from(data[1]['teaId'], 'hex').toString('base64'),
    //     targetTeaId: Buffer.from(data[1]['targetTeaId'], 'hex').toString('base64'),
    //     isPass: Boolean(data[1]['isPass']),
    //     targetStatus: data[1]['targetStatus'].toString(),
    //   };
    //   console.log('send event: ', commitRaResultEvent);
    //   this.rpc_client.call("commitRaResult", [commitRaResultEvent]);
    // });
  }

  async layer1_rpc (method, params=[]){
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

  async initDummyRaTx(){
    const api = this.layer1.getApi();

    const ac = this.layer1.getAccountFrom(ACCOUNT_URI);
    const ac_cml_list = await this.layer1_rpc('cml_userCmlList', [
      ac.address
    ]);
    const cml_list = await Promise.all(_.map(ac_cml_list, async (cml_id)=>{
      let cml = await api.query.cml.cmlStore(cml_id);
      cml = cml.toJSON();
      cml.machine_id_str = hexToString(cml.machine_id);

      return cml;
    }));

    const list = _.filter(cml_list, (item)=>!!item.machine_id);
    // console.log(1, list);

    await Promise.all(_.map(list, async (cml)=>{
      console.log(chalk.green(`Start dummy for cml_id => ${cml.intrinsic.id}, machine_id => ${cml.machine_id_str}`));
      const tx = api.tx.cml.dummyRaTask(cml.machine_id);
      await this.layer1.sendTx(ac, tx);

      await sleep(DUMMY_RA_TIME);

      return null;
    }));

    

    await sleep(DUMMY_RA_TIME);
    await this.initDummyRaTx();

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
