const {runSample} = require('./utils');

runSample(null, async (layer1)=>{
  const api = layer1.getApi();
  
  const alice = layer1.getAccountFrom('Alice');
  const bob = layer1.getAccountFrom('Bob');
  // console.log(11, api.query.assets);

  let alice_dai = await api.query.cml.daiStore(alice.address);
  console.log('alice dai =>', alice_dai.toHuman());
  let bob_dai = await api.query.cml.daiStore(bob.address);
  console.log('bob dai =>', bob_dai.toHuman());

  // transfer 100 dai from alice to bob
  console.log('transfer 10 dai from alice to bob');
  const tx = api.tx.cml.transferDai(bob.address, 10);
  await layer1.sendTx(alice, tx);

  alice_dai = await api.query.cml.daiStore(alice.address);
  console.log('alice dai =>', alice_dai.toHuman());
  bob_dai = await api.query.cml.daiStore(bob.address);
  console.log('bob dai =>', bob_dai.toHuman());

  let alice_cml = await api.query.cml.cmlStore(alice.address);
  console.log('alice cml =>', alice_cml.toHuman());

  // convert 1 dai to cml
  const convert_tx = api.tx.cml.convertCmlFromDai();
  await layer1.sendTx(alice, convert_tx);

  alice_cml = await api.query.cml.cmlStore(alice.address);
  console.log('alice cml =>', alice_cml.toHuman());
  alice_dai = await api.query.cml.daiStore(alice.address);
  console.log('alice dai =>', alice_dai.toHuman());
});