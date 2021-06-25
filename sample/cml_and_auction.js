const {runSample, sleep, _} = require('./utils');

runSample(null, async (layer1)=>{
  const api = layer1.getApi();

  const ac = layer1.getAccountFrom('runway where sponsor visual reject drill dwarf tired wild flag monitor test');
  
  const alice = layer1.getAccountFrom('Alice');
  const bob = layer1.getAccountFrom('Bob');

  let balance = await layer1.getAccountBalance(ac.address);
  console.log('ac => ', balance);

  // bid for auction 

  const tx1 = api.tx.auction.bidForAuction(1, 300*layer1.asUnit());
  await layer1.sendTx(bob, tx1);

  const tx2 = api.tx.auction.bidForAuction(1, 300*layer1.asUnit());
  await layer1.sendTx(alice, tx2);

  await sleep(10000);



  
});
