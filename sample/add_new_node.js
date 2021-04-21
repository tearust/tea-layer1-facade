const {runSample, _} = require('./utils');

runSample(null, async (rpc)=>{
  

  await rpc.call('add_new_node', ['aaaaaaa']);
  

}, 'rpc');