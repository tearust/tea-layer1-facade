const toHex = require('to-hex');
const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types');
const rpc = require('../src/rpc');

async function main() {
      const api = await ApiPromise.create({
            types,
            rpc
      })

      const nodes = await api.query.tea.bootstrapNodes.entries()
      const teaNodes = nodes.map((n) => {
            return n[1]
      })

      console.log("teaNodes", JSON.stringify(teaNodes));
}

main()