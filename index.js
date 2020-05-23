const NATS = require('nats')
const { ApiPromise } = require('@polkadot/api')

const nc = NATS.connect()

function handle_new_header(header) {
      nc.publish('layer1.chain.newheader', `${header.number}.${header.hash}`)
}

async function main() {
      const api = await ApiPromise.create({
            types: {
                  Node: {
                        "key": "Bytes",
                        "amt": "u64"
                  },
                  Model: {
                        "account": "AccountId",
                        "payment": "u32",
                        "cid": "H256"
                  },
                  Task: {
                        "account": "H256",
                        "amt": "Balance",
                        "model_id": "Hash",
                        "cid": "Hash"
                  },
                  Competitor: {
                        "account": "H256",
                        "task_id": "Hash",
                        "random_value": "H256"
                  }
            }
      })

      // listen new block
      api.rpc.chain.subscribeNewHeads((header) => {
            // console.log(`chain is at #${header.number} has hash ${header.hash}`)
            handle_new_header(header)
      })

      nc.subscribe('layer1.async.*.>', async function (msg, reply, subject, sid) {
            // console.log('Received a message: ', msg, reply, subject, sid)
            const subSections = subject.split('.')
            // console.log(subSections)
            const replyTo = subSections[2]
            const action = subSections[3]
            switch(action) {
                  case 'bootstrap':
                        nc.publish(replyTo + '.action.bootstrap', JSON.stringify(['tea-node1', 'tea-node2']))
                        break;
                  case 'node_info':
                        const nodeInfo = await api.query.tea.nodes(msg);
                        nc.publish(replyTo + '.action.node_info', JSON.stringify(nodeInfo))
                        break;
                  default:
                        nc.publish(replyTo + '.error.action_does_not_support', '')
            }
      })
}

main().catch((error) => {
      console.error(error)
      process.exit(-1)
})