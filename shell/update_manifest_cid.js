/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
const { ApiPromise, Keyring, WsProvider } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')
const proto = require('../src/proto')
const BN = require('bn.js')

const yi = new BN('100000000', 10)
const million = new BN('10000000', 10)
const unit = yi.mul(million)

async function updateManifest (layer1_account, tea_id, manifest_cid, api) {
  const keyring = new Keyring({ type: 'sr25519' })

  const ac = keyring.addFromUri(`//${layer1_account}`, { name: `${layer1_account} default` })
  const teaId = '0x' + tea_id

  await api.tx.tea.updateManifest(teaId, manifest_cid)
    .signAndSend(ac, ({ events = [], status }) => {
      if (status.isInBlock) {
        console.log('Included at block hash', status.asInBlock.toHex())
        console.log('Events:')
        events.forEach(({ event: { data, method, section }, phase }) => {
          console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString())
        })
      } else if (status.isFinalized) {
        console.log('Finalized block hash', status.asFinalized.toHex())

        process.exit(0)
      }
    })

  console.log('send updateManifest tx')
}

async function main () {
  console.log('start update manifest cid')
  const wsurl = process.env.FACADE_WSURL
  const layer1_account = process.env.FACADE_ACCOUNT_URI
  const tea_id = process.argv[2]
  const manifest_cid = process.argv[3]
  if (!wsurl || !layer1_account || !tea_id || !manifest_cid) {
    console.error('invalid args')
    process.exit(0)
  }
  console.log('wsurl => ', wsurl)
  console.log('layer1_account => ', layer1_account)
  console.log('tea_id => ', tea_id)
  console.log('manifest_cid => ', manifest_cid)

  const wsProvider = new WsProvider(wsurl)
  const api = await ApiPromise.create({
    provider: wsProvider,
    types,
    rpc
  })

  await cryptoWaitReady()

  await updateManifest(layer1_account, tea_id, manifest_cid, api)
}

main()
