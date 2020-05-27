const NATS = require('nats')
const { ApiPromise } = require('@polkadot/api')

const nc = NATS.connect();

const cache = {
      latest_block_height : 0,
      latest_block_hash: '',
};

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
                  TeaId: "Vec<u8>",
                  PeerId: "Vec<u8>"
            }
      })

      // listen new block
      api.rpc.chain.subscribeNewHeads((header) => {
            console.log(`chain is at #${header.number} has hash ${header.hash}`)
            cache.latest_block_hash = header.hash;
            cache.latest_block_height = header.number;
            handle_new_header(header)
      })

      nc.subscribe('layer1.async.*.>', async function (msg, reply, subject, sid) {
            console.log('Received a message: ', msg, reply, subject, sid)
            const subSections = subject.split('.')
            // console.log(subSections)
            if (subSections.length < 4) {
                  console.log('invalid subject')
                  return
            }
            const replyTo = subSections[2]
            const action = subSections[3]
            switch(action) {
                  case 'bootstrap':
                        nc.publish(reply, JSON.stringify(['tea-node1', 'tea-node2']))
                        break;
                  case 'node_info':
                        const nodeInfo = await api.query.tea.nodes(msg);
                        nc.publish(reply, JSON.stringify(nodeInfo))
                        break;
                  case 'latest_block':
                        nc.publish(reply, JSON.stringify(cache));
                        break;
                  default:
                        nc.publish(reply, JSON.stringify(['action_does_not_support']))
            }
      })
}

main().catch((error) => {
      console.error(error)
      process.exit(-1)
})