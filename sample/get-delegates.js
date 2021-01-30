const { ApiPromise, Keyring } = require('@polkadot/api')
const types = require('../src/types')
const rpc = require('../src/rpc')

async function main () {
  const api = await ApiPromise.create({
    types,
    rpc
  })

  // const header = await api.rpc.chain.getHeader();
  // const prevHash = await api.rpc.chain.getBlockHash(header.blockNumber.subn(42));
  const startPosition = 0
  const neededDelegatesCount = 20
  const delegates = await api.rpc.tea.getDelegates(startPosition, neededDelegatesCount)
  console.log('tea_getDelegates result:', delegates.toString())
  for (let i = 0; i < delegates.length; i++) {
    console.log("pubkey:", delegates[i][0].toString(), "tea_id:", delegates[i][1].toString(), "peer_id:", delegates[i][2].toString())
  }
  console.log('call rpc tea_getDelegates finished')
}

main()
