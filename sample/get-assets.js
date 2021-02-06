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

  const assets = await api.query.gluon.assets.entries()
  console.log(assets.toString())

  const multiAssetInfos = []
  assets.forEach((asset, i) => {
    const p2DeploymentIds = []
    asset[1].deploymentIds.forEach((id, i) => {
      p2DeploymentIds.push(id.toString().slice(2))
    })
    const AssetInfo = {
      sender: u8aToHex(asset[1].owner).slice(2),
      p2: u8aToHex(asset[1].p2).slice(2),
      p2DeploymentIds: p2DeploymentIds,
    }
    console.log()
    const multiAssetInfo = {
      multiSigAccount: Buffer.from(asset[1].multiSigAccount, 'hex'),
      assetInfo: AssetInfo
    }
    multiAssetInfos.push(multiAssetInfo)
  })

  const getAssetsResponse = {
    assets: multiAssetInfos
  }

  console.log('newGetAssetsResponse:', JSON.stringify(getAssetsResponse))
  const responseBuf = new proto.DelegateProtobuf('GetAssetsResponse')
  responseBuf.payload(getAssetsResponse)
  const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64')
  console.log('GetAssetsResponse Base64', responseBase64)

  console.log('call api.query.gluon.assets')
}

main()
