const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToHex } = require('@polkadot/util')
const types = require('../src/types')
const rpc = require('../src/rpc')
const proto = require('../src/proto')

async function main () {
  const api = await ApiPromise.create({
    types,
    rpc
  })

  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });

  const multi_sig_accounts = await api.query.gluon.browserMultiSigAccounts(alice.publicKey)
  console.log(multi_sig_accounts.toString())

  const account = Buffer.from(multi_sig_accounts[0], 'hex').toString()
  console.log("account:", account)

  const asset = await api.query.gluon.assets(account)
  console.log(asset.toString())

  const p2DeploymentIds = []
  asset.deploymentIds.forEach((id, i) => {
    p2DeploymentIds.push(id.toString().slice(2))
  })
  const AssetInfo = {
    sender: u8aToHex(asset.owner).slice(2),
    p2: u8aToHex(asset.p2).slice(2),
    p2DeploymentIds: p2DeploymentIds,
  }

  console.log(AssetInfo)

  console.log('call api.query.gluon.assets')
}

main()
