const {runSample, sleep, _,} = require('./utils');

runSample(null, async (layer1)=>{
  const api = layer1.getApi();
  
  api.rpc.chain.subscribeNewHeads(async (header) => {
    console.log(`chain is at #${header.number} has hash ${header.hash}`);
    // console.log(111, header.digest.logs.toHuman());
    const block = await api.rpc.chain.getBlock(header.hash);
    const tmp = block.toJSON();
    // console.log(block.toHuman());
    const list = block.block.extrinsics.toHuman();

    Promise.all(_.each(list, async (item)=>{
      if(item.isSigned){
        console.log(item);

        const _id = await api.query.cml.lastCmlId();
        console.log(222, _id.toJSON());
      }
      
    }))

    // const b1 = await api.rpc.chain.getBlock(tmp.block.header.parentHash);
    // console.log(b1.toHuman());
  });

  console.log("Press Ctrl+C to exit");
  await sleep(10000000);

});