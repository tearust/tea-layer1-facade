const server = require('../src/jsonrpc/server');

const {runSample, sleep, _} = require('./utils');



runSample(null, async ()=>{
  const rpc_server = new server();
  await rpc_server.init();

  await sleep(1000*60*30);

}, 'rpc');