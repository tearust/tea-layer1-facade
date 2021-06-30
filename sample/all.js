const {runSample, sleep, _, assert, layer1_rpc} = require('./utils');

const F = {
  async getVouchers(layer1_instance, address){
    const api = layer1_instance.getApi();

    const voucher_investor_A = await api.query.cml.investorVoucherStore(address, 'A');
    const voucher_investor_B = await api.query.cml.investorVoucherStore(address, 'B');
    const voucher_investor_C = await api.query.cml.investorVoucherStore(address, 'C');

    const voucher_team_A = await api.query.cml.teamVoucherStore(address, 'A');
    const voucher_team_B = await api.query.cml.teamVoucherStore(address, 'B');
    const voucher_team_C = await api.query.cml.teamVoucherStore(address, 'C');

    return {
      voucher_investor_A: voucher_investor_A.toJSON(),
      voucher_investor_B: voucher_investor_B.toJSON(),
      voucher_investor_C: voucher_investor_C.toJSON(),
      voucher_team_A: voucher_team_A.toJSON(),
      voucher_team_B: voucher_team_B.toJSON(),
      voucher_team_C: voucher_team_C.toJSON(),
    }
  },
  async getAllBalance(layer1_instance, address){
    const api = layer1_instance.getApi();
    let tmp = await api.query.system.account(address);
    tmp = tmp.data;

    let reward = await api.query.cml.accountRewards(address);
    reward = reward.toJSON();
    
    const free = parseInt(tmp.free, 10) / layer1_instance.asUnit();
    const lock = parseInt(tmp.reserved, 10) / layer1_instance.asUnit();
    if(reward){
      reward = reward / layer1_instance.asUnit();
    }

    let debt = await api.query.cml.genesisMinerCreditStore(address);
    debt = debt.toJSON();
    if(debt){
      debt = debt / layer1_instance.asUnit();
    }

    return {
      free: Math.floor(free*10000)/10000,
      lock: Math.floor(lock*10000)/10000,
      reward: reward ? Math.floor(reward*10000)/10000 : null,
      debt: debt ? Math.floor(debt*10000)/10000 : null,
    };
  },
  async transferBalance(layer1_instance, from, to, amount){
    const api = layer1_instance.getApi();
    const total = layer1_instance.asUnit() * amount;
    const transfer_tx = api.tx.balances.transfer(to.address, total);
    await layer1_instance.sendTx(from, transfer_tx);
  },
};

runSample(null, async (layer1)=>{
  const api = layer1.getApi();
  const ac = layer1.getAccountFrom('runway where sponsor visual reject drill dwarf tired wild flag monitor test');
  const dave = layer1.getAccountFrom('Dave');
  const charlie = layer1.getAccountFrom('Charlie');

  // transfer 10 tea to dave
  await F.transferBalance(layer1, ac, dave, 10);

  let dave_balance = await F.getAllBalance(layer1, dave.address);
  assert(dave_balance.free, 10, 'Transfer Balance incorrect.');

  // transfer 10 C-Investor vouchers to dave
  const transfer_voucher_tx = api.tx.cml.transferVoucher(dave.address, 'C', 'Investor', 10);
  await layer1.sendTx(ac, transfer_voucher_tx);
  await sleep(1000);
  const dave_vouchers = await F.getVouchers(layer1, dave.address);
  assert(dave_vouchers.voucher_investor_C.amount, 10, 'Transfer Voucher incorrect.');

  // dave luckdraw the vouchers to cml seeds.
  const dave_luckdraw_tx = api.tx.cml.drawCmlsFromVoucher('Investor');
  await layer1.sendTx(dave, dave_luckdraw_tx);
  await sleep(1000);
  const dave_cml_id_list = await layer1_rpc('cml_getUserCmlList', [dave.address]);
  assert(dave_cml_id_list.length, 10, 'User Cml List length incorrect.');

  

  await sleep(1000);



  
});
