const { ApiRx } = require('@polkadot/api')

async function chain_listener(fn) {
      // initialise via static create
      const api = await ApiRx.create().toPromise()

      // make a call to retrieve the current network head
      api.rpc.chain.subscribeNewHeads().subscribe((header) => {
            // console.log(`Chain is at #${header.number} has hash ${header.hash}`)
            fn(header)
      })
}

module.exports = {
      chain_listener
}