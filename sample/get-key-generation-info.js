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

  const assetInfo = await api.query.gluon.assets('testAddress')
  console.log('get_key_generation_info_request result:', assetInfo.toString())

  const asset = assetInfo.toJSON()
  const keyGenerationInfo = {
    p1PublicKey: Buffer.from(asset.dataAdhoc.p1.slice(2), 'hex'),
    p2PublicKey: Buffer.from(asset.p2.slice(2), 'hex'),
    n: asset.dataAdhoc.n,
    k: asset.dataAdhoc.k,
    keyType: Buffer.from(asset.dataAdhoc.keyType.slice(2), 'hex').toString(),
  }

  const getKeyGenerationInfoResponse = {
    keyGenerationInfo: keyGenerationInfo
  }

  console.log('newGetKeyGenerationInfoResponse:', JSON.stringify(getKeyGenerationInfoResponse))
  const responseBuf = new proto.DelegateProtobuf('GetKeyGenerationInfoResponse')
  responseBuf.payload(getKeyGenerationInfoResponse)
  const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64')
  console.log('GetKeyGenerationInfoResponse Base64', responseBase64)

  console.log('call api.query.gluon.assets')
}

main()
