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
  const neededDelegatesCount = 1
  const delegates = await api.rpc.tea.getDelegates(startPosition, neededDelegatesCount)
  console.log('gluon_getDelegates result:', delegates.toString())

  console.log('call rpc gluon_getDelegates finished')
}

main()
