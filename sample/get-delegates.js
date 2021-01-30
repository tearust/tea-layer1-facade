const { ApiPromise, Keyring } = require('@polkadot/api')
const types = require('../src/types')
const rpc = require('../src/rpc')
const { stringToU8a, u8aToHex } = require('@polkadot/util')

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
  const delegateItems = []
  for (let i = 0; i < delegates.length; i++) {
    console.log(delegates[i].toString() )
    const delegateItem = {
      teaId: Buffer.from(delegates[i][1].slice(2), 'hex'),
      peerId:  Buffer.from(delegates[i][2].toString().slice(2), 'hex').toString()
    }
    delegateItems.push(delegateItem)
  }

  const getDelegatesResponse = {
    delegates: delegateItems,
  }

  console.log(getDelegatesResponse)


  // const addr_hex = '0x516d5a6a4b78783953736d56634e384339487a33375035675050785344617435346962584e644e57766133557034'
  // console.log( Buffer.from(addr_hex.slice(2), 'hex').toString())

  console.log('call rpc tea_getDelegates finished')
}

main()
