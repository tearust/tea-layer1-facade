const NATS = require('nats')
const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')

const nc = NATS.connect();

const cache = {
      latest_block_height : 0,
      latest_block_hash: '',

      peer_url_list: []
};

function handle_new_header(header) {
      nc.publish(`layer1.chain.newheader.${header.number}`, `${header.hash}`)
}

async function main() {
      const api = await ApiPromise.create({
            types: {
                  Weight: "u32",
                  Address: "AccountId",
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

      await cryptoWaitReady()


      // listen new block
      api.rpc.chain.subscribeNewHeads((header) => {
            //console.log(`chain is at #${header.number} has hash ${header.hash}`)
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
                  
            const keyring = new Keyring({ type: 'sr25519' });
            const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });

            switch(action) {
                  case 'bootstrap':
                        nc.publish(reply, JSON.stringify(['tea-node1', 'tea-node2']))
                        break
                  case 'node_info':
                        const nodeInfo = await api.query.tea.nodes(msg)
                        nc.publish(reply, JSON.stringify(nodeInfo))
                        break
                  case 'latest_block':
                        nc.publish(reply, JSON.stringify(cache))
                        break
                  case 'get_block_hash':
                        const blockHash = await api.rpc.chain.getBlockHash(parseInt(msg))
                        nc.publish(reply, JSON.stringify(blockHash))
                        break
                  case 'put_peer_url':
                        // TODO put url to layer1
                        const list = {
                              list: put_peer_url(msg)
                        };
                        nc.publish(reply, JSON.stringify(list));
                        break
                  case 'transfer':
                        const subMsgs = msg.split('_')
                        await transfer(api, alice, subMsgs[0], parseInt(subMsgs[1]));
                        console.log('send transfer');
                        break
                  case 'add_new_node':
                        await add_new_node(api, alice, '0xa2d56e0a85f22450963acb427530073b497fb73d3ff48eb3ab534fb483b7e412');
                        console.log('send add_new_node tx')
                        break
                  case 'update_peer_id':
                        await update_peer_id(api, alice, '0xa2d56e0a85f22450963acb427530073b497fb73d3ff48eb3ab534fb483b7e412', '0x13363206e8593bb175c94ee0a978ece66ecf911396bffc4a1dffc0c589a51e13');
                        console.log('send update_peer_id tx')
                        break
                  default:
                        nc.publish(reply, JSON.stringify(['action_does_not_support']))
            }
      })
}

function put_peer_url(msg){
      console.log('receive peer url : ', msg);
      let n = cache.peer_url_list.find((x) => x === msg);
      if(!n){
            cache.peer_url_list.push(msg);
      }

      const rs = [];
      cache.peer_url_list.forEach((x) => {
            if(x !== msg){
                  rs.push(x);
            }
      })

      return rs;
}

async function transfer(api, sender, recipient, amount) {
      // Create a extrinsic, transferring randomAmount units to Bob.
      const unsub = await api.tx.balances
            .transfer(recipient, amount)
            .signAndSend(sender, ({ events = [], status }) => {
                  console.log(`Current status is ${status.type}`);
                  if (status.isFinalized) {
                        console.log(`Transaction included at blockHash ${status.asFinalized}`);

                        // Loop through Vec<EventRecord> to display all events
                        events.forEach(({ phase, event: { data, method, section } }) => {
                        console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
                        });

                        unsub();
                  }
      });
}

async function add_new_node(api, sender, tea_id) {
      // Create a extrinsic, add new node.
      const transfer = api.tx.tea.addNewNode(tea_id);

      // Sign and Send the transaction
      await transfer.signAndSend(sender, ({ events = [], status }) => {
            if (status.isInBlock) {
                  console.log('Successful add new node with tea_id ' + tea_id);
            } else {
                  console.log('Status of transfer: ' + status.type);
            }

            events.forEach(({ phase, event: { data, method, section } }) => {
                  console.log(phase.toString() + ' : ' + section + '.' + method + ' ' + data.toString());
            });
      });
}

async function update_peer_id(api, sender, tea_id, peer_id) {
      // Create a extrinsic, update peer id.
      const transfer = api.tx.tea.updatePeerId(tea_id, peer_id);

      // Sign and Send the transaction
      transfer.signAndSend(sender, ({ events = [], status }) => {
            if (status.isInBlock) {
                  console.log('Successful add new node with tea_id ' + tea_id);
            } else {
                  console.log('Status of transfer: ' + status.type);
            }

            events.forEach(({ phase, event: { data, method, section } }) => {
                  console.log(phase.toString() + ' : ' + section + '.' + method + ' ' + data.toString());
            });
      });
}

main().catch((error) => {
      console.error(error)
      process.exit(-1)
})