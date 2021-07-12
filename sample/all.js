const { runSample, sleep, _, assert, layer1_rpc } = require('./utils');
const { hexToString } = require('tearust_layer1');

const F = {
  async getCoupons(layer1_instance, address) {
    const api = layer1_instance.getApi();

    const coupon_investor_A = await api.query.cml.investorCouponStore(address, 'A');
    const coupon_investor_B = await api.query.cml.investorCouponStore(address, 'B');
    const coupon_investor_C = await api.query.cml.investorCouponStore(address, 'C');

    const coupon_team_A = await api.query.cml.teamCouponStore(address, 'A');
    const coupon_team_B = await api.query.cml.teamCouponStore(address, 'B');
    const coupon_team_C = await api.query.cml.teamCouponStore(address, 'C');

    return {
      coupon_investor_A: coupon_investor_A.toJSON(),
      coupon_investor_B: coupon_investor_B.toJSON(),
      coupon_investor_C: coupon_investor_C.toJSON(),
      coupon_team_A: coupon_team_A.toJSON(),
      coupon_team_B: coupon_team_B.toJSON(),
      coupon_team_C: coupon_team_C.toJSON(),
    }
  },
  async getAllBalance(layer1_instance, address) {
    const api = layer1_instance.getApi();
    let tmp = await api.query.system.account(address);
    tmp = tmp.data;

    let reward = await api.query.cml.accountRewards(address);
    reward = reward.toJSON();

    const free = parseInt(tmp.free, 10) / layer1_instance.asUnit();
    const lock = parseInt(tmp.reserved, 10) / layer1_instance.asUnit();
    if (reward) {
      reward = reward / layer1_instance.asUnit();
    }

    let debt = await api.query.cml.genesisMinerCreditStore(address);
    debt = debt.toJSON();
    if (debt) {
      debt = debt / layer1_instance.asUnit();
    }

    return {
      free: Math.floor(free * 10000) / 10000,
      lock: Math.floor(lock * 10000) / 10000,
      reward: reward ? Math.floor(reward * 10000) / 10000 : null,
      debt: debt ? Math.floor(debt * 10000) / 10000 : null,
    };
  },
  async transferBalance(layer1_instance, from, to, amount) {
    const api = layer1_instance.getApi();
    const total = layer1_instance.asUnit() * amount;
    const transfer_tx = api.tx.balances.transfer(to.address, total);
    await layer1_instance.sendTx(from, transfer_tx);
  },
  async assertWithTxError(layer1, account, tx, error) {
    try {
      await layer1.sendTx(account, tx);
    } catch (e) {
      assert(e, error, 'Layer1 Error incorrect.');
    }
  },
  async getCmlByList(layer1_instance, cml_list) {
    const api = layer1_instance.getApi();

    const list = await Promise.all(_.map(cml_list, async (cml_id) => {
      let cml = await api.query.cml.cmlStore(cml_id);
      cml = cml.toJSON();

      return {
        ...cml,
        ...cml.intrinsic,
        machine_id: hexToString(cml.machine_id),
      };
    }));

    return list;

  }
};

runSample(null, async (layer1) => {
  const api = layer1.getApi();
  const ac = layer1.getAccountFrom('runway where sponsor visual reject drill dwarf tired wild flag monitor test');
  const dave = layer1.getAccountFrom('Dave');
  const charlie = layer1.getAccountFrom('Charlie');

  let ac_balance;

  // transfer 10 tea to dave and charlie
  await F.transferBalance(layer1, ac, dave, 10);
  await F.transferBalance(layer1, ac, charlie, 10);

  let dave_balance = await F.getAllBalance(layer1, dave.address);
  assert(dave_balance.free, 10, 'Transfer Balance incorrect.');

  // transfer 10 C-Investor coupons to dave
  const transfer_coupon_tx = api.tx.cml.transferCoupon(dave.address, 'C', 'Investor', 10);
  await layer1.sendTx(ac, transfer_coupon_tx);
  await sleep(1000);
  const dave_coupons = await F.getCoupons(layer1, dave.address);
  assert(dave_coupons.coupon_investor_C.amount, 10, 'Transfer Coupon incorrect.');

  // dave luckdraw the coupons to cml seeds.
  const dave_luckdraw_tx = api.tx.cml.drawCmlsFromCoupon('Investor');
  await layer1.sendTx(dave, dave_luckdraw_tx);
  await sleep(1000);
  let dave_cml_id_list = await layer1_rpc('cml_getUserCmlList', [dave.address]);
  assert(dave_cml_id_list.length, 10, 'User Cml List length incorrect.');

  // ac luckdraw the coupons to cml seeds
  const ac_luckdraw_tx = api.tx.cml.drawCmlsFromCoupon('Investor');
  await layer1.sendTx(ac, ac_luckdraw_tx);
  await sleep(1000);
  let ac_cml_id_list = await layer1_rpc('cml_getUserCmlList', [ac.address]);
  assert(ac_cml_id_list.length, 30, 'User Cml List length incorrect.');

  // dave put the first cml to auction store
  const dave_put_auction_tx = api.tx.auction.putToStore(dave_cml_id_list[0], 100 * layer1.asUnit(), 200 * layer1.asUnit());
  await layer1.sendTx(dave, dave_put_auction_tx);
  await sleep(1000);

  const dave_auction_store = (await api.query.auction.userAuctionStore(dave.address)).toJSON();
  assert(dave_auction_store.length, 1, 'User auction store length incorrect.');

  const auction_id = dave_auction_store[0];

  // charlie try to bid for auction
  const charlie_bid_auction_tx = api.tx.auction.bidForAuction(auction_id, 10 * layer1.asUnit());
  await F.assertWithTxError(layer1, charlie, charlie_bid_auction_tx, 'NotEnoughBalance');
  await sleep(1000);

  // ac bid for auction with buy_now_price
  const ac_bid_auction_tx = api.tx.auction.bidForAuction(auction_id, 200 * layer1.asUnit());
  await layer1.sendTx(ac, ac_bid_auction_tx);

  assert((await F.getAllBalance(layer1, dave.address)).free > 200, true, 'Balance incorrect after auction success.');

  ac_cml_id_list = await layer1_rpc('cml_getUserCmlList', [ac.address]);
  assert(ac_cml_id_list.length, 31, 'Cml list length incorrect after auction success.');
  dave_cml_id_list = await layer1_rpc('cml_getUserCmlList', [dave.address]);
  assert(dave_cml_id_list.length, 9, 'Cml list length incorrect after auction success.');


  // find a defrost 0 cml seed to plant
  const ac_cml_list = await F.getCmlByList(layer1, ac_cml_id_list);
  const dave_cml_list = await F.getCmlByList(layer1, dave_cml_id_list);

  let ac_seed_cml_id = _.find(ac_cml_list, (x) => x.generate_defrost_time < 1);
  if (ac_seed_cml_id) ac_seed_cml_id = ac_seed_cml_id.id;
  let dave_seed_cml_id = _.find(dave_cml_list, (x) => x.generate_defrost_time < 1);
  if (dave_seed_cml_id) dave_seed_cml_id = dave_seed_cml_id.id;


  await sleep(1000);

  console.log('dave cml seed => ', dave_seed_cml_id);
  if (dave_seed_cml_id) {
    console.log('plant dave cml seed.');

    const dave_plant_tx = api.tx.cml.startMining(dave_seed_cml_id, 'miner', '1.2.3.4');
    await layer1.sendTx(dave, dave_plant_tx);
    await sleep(1000);

    // dave balance: { free: 0, lock: 209.9996, reward: null, debt: 790.0003 }
    dave_balance = await F.getAllBalance(layer1, dave.address);
    assert(Math.round(dave_balance.debt), 790, 'Dave debt balance incorrect.');

    // ac staking to dave cml
    const ac_staking_tx = api.tx.cml.startStaking(dave_seed_cml_id, null);
    await layer1.sendTx(ac, ac_staking_tx);
    await sleep(1000);

    ac_balance = await F.getAllBalance(layer1, ac.address);
    assert(ac_balance.lock, 1000, 'ac staking lock balance incorrect.');
  }




});
