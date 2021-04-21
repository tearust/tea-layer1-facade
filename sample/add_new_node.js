const {runSample, sleep, _} = require('./utils');

const client = require('../src/jsonrpc/client');

runSample(null, async ()=>{
  const c = new client({
    http_url: 'http://localhost:3330',
  });

  const rs_add = await c.call('test', [10, 20]);
  console.log('add => '+rs_add);

  

}, 'rpc');