const NATS = require('nats')
const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const _ = require('lodash');
const proto = require('./proto');
const toHex = require('to-hex');

const nc = NATS.connect();

const cache = {
      latest_block_height : 0,
      latest_block_hash: '',

      peer_url_list: []
};

async function main() {
      const api = await ApiPromise.create({
            types: {
                  Weight: "u32",
                  Address: "AccountId",
                  TeaId: "Bytes",
                  PeerId: "Bytes",
                  Node: {
                        "TeaId": "TeaId",
                        "Peers": "Vec<PeerId>"
                  },
                  Model: {
                        "account": "AccountId",
                        "payment": "u32",
                        "cid": "H256"
                  },
                  Task: {
                        "delegate_node": "TeaId",
                        "ref_num": "Bytes",
                        "rsa_pub": "Bytes",
                        "cap_cid": "Bytes",
                        "manifest_cid": "Bytes",
                        "wasm_cid": "Bytes",
                        "model_cid": "Bytes",
                        "data_cid": "Bytes",
                        "payment": "Balance"
                  }
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

      // Subscribe to system events via storage
      api.query.system.events((events) => {
            handle_events(events)
      });

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
                        var teaId = msg
                        await api.tx.tea.addNewNode(teaId)
                              .signAndSend(alice, ({ events = [], status }) => {
                                    if (status.isInBlock) {
                                          console.log('Successful add new node with teaId ' + teaId);
                                          nc.publish(reply, JSON.stringify({status, teaId}))
                                    } else {
                                          console.log('Status of transfer: ' + status.type);
                                    }

                                    events.forEach(({ phase, event: { data, method, section } }) => {
                                          console.log(phase.toString() + ' : ' + section + '.' + method + ' ' + data.toString());
                                    });
                        });
                        console.log('send add_new_node tx')
                        break
                  case 'update_peer_id':
                        var teaInfo = msg.split('__')
                        var teaId = teaInfo[0]
                        let peers = teaInfo[1].split('_')
                        await api.tx.tea.updatePeerId(teaId, peers)
                              .signAndSend(alice, ({ events = [], status }) => {
                                    if (status.isInBlock) {
                                          console.log('Successful add new node with teaId ' + teaId);
                                          nc.publish(reply, JSON.stringify({status, teaId}))
                                    } else {
                                          console.log('Status of transfer: ' + status.type);
                                    }

                                    events.forEach(({ phase, event: { data, method, section } }) => {
                                          console.log(phase.toString() + ' : ' + section + '.' + method + ' ' + data.toString());
                                    });
                        });
                        console.log('send update_peer_id tx')
                        break
                  case 'add_new_task':
                        const protoMsg = Buffer.from(msg, 'base64');
                        const newTaskBuf = new proto.Protobuf('AddNewTaskRequest');
                        const newTask = newTaskBuf.decode(protoMsg);
                        console.log(newTask);
                        
                        var teaId = toHex(newTask.task.teaId, { addPrefix: true });
                        console.log(teaId);
                        let refNum = toHex(newTask.task.refNum, { addPrefix: true });
                        let rsaPub = toHex(newTask.task.rsaPub, { addPrefix: true });
                        let capCid = toHex(Buffer.from(newTask.task.capCid), { addPrefix: true });
                        let manifestCid = toHex(Buffer.from(newTask.task.manifestCid), { addPrefix: true });
                        let wasmCid = toHex(Buffer.from(newTask.task.wasmCid), { addPrefix: true });
                        let modelCid = toHex(Buffer.from(newTask.task.modelCid), { addPrefix: true });
                        let dataCid = toHex(Buffer.from(newTask.task.dataCid), { addPrefix: true });
                        let payment = newTask.task.payment;

                        await api.tx.tea.addNewTask(teaId, refNum, rsaPub, capCid, manifestCid, wasmCid, modelCid, dataCid, payment)
                              .signAndSend(alice, ({ events = [], status }) => {
                                    if (status.isInBlock) {
                                          console.log('Included at block hash', status.asInBlock.toHex());
                                          console.log('Events:');
                                          events.forEach(({ event: { data, method, section }, phase }) => {
                                                console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                                          });
                                    } else if (status.isFinalized) {
                                          console.log('Finalized block hash', status.asFinalized.toHex());
                                    }
                        });
                        console.log('send add_new_task tx')
                        break
                  case 'complete_task':
                        const taskId = msg;
                        await api.tx.tea.completeTask(taskId)
                              .signAndSend(alice, ({ events = [], status }) => {
                                    if (status.isInBlock) {
                                          console.log('Included at block hash', status.asInBlock.toHex());
                                          console.log('Events:');
                                          events.forEach(({ event: { data, method, section }, phase }) => {
                                                console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                                          });
                                    } else if (status.isFinalized) {
                                          console.log('Finalized block hash', status.asFinalized.toHex());
                                    }
                        });
                        console.log('send add_new_task tx')
                        break
                  case 'get_nodes':
                        const nodes = await api.query.tea.nodes.entries()
                        const teaNodes = nodes.map((n) => {
                              return n[1]
                        })
                        nc.publish(reply, JSON.stringify(teaNodes))
                        break
                  default:
                        nc.publish(reply, JSON.stringify(['action_does_not_support']))
            }
      })
}

function handle_new_header(header) {
      nc.publish(`layer1.chain.newheader.${header.number}`, `${header.hash}`)
}

function handle_events(events) {
      // Loop through the Vec<EventRecord>
      events.forEach((record) => {
            // Extract the phase, event and the event types
            const { event, phase } = record;
            const types = event.typeDef;
        
            if (event.section == 'tea') {
                  console.log(`Received tea events:`);

                  let eventData = {}
                  // Loop through each of the parameters, displaying the type and data
                  event.data.forEach((data, index) => {
                        // console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
                        eventData[types[index].type] = data
                  });

                  switch (event.method) {
                        case 'NewTaskAdded':
                              var msg = {}
                              msg['account_id'] = eventData.AccountId
                              msg['delegate_node'] = {
                                    tea_id: eventData.Node.TeaId,
                                    peers: eventData.Node.Peers
                              }
                              msg['ref_num'] = eventData.Task.ref_num
                              msg['rsa_pub'] = eventData.Task.rsa_pub
                              msg['cap_cid'] = eventData.Task.cap_cid
                              msg['model_cid'] = eventData.Task.model_cid
                              msg['data_cid'] = eventData.Task.data_cid
                              msg['payment'] = eventData.Task.payment

                              console.log(JSON.stringify(msg))
                              nc.publish(`layer1.event.${event.section}.${event.method}`, JSON.stringify(msg))
                              break
                        case 'NewModelAdded':
                              var msg = {}
                              msg['account_id'] = eventData.AccountId

                              console.log(JSON.stringify(msg))
                              nc.publish(`layer1.event.${event.section}.${event.method}`, JSON.stringify(msg))
                              break
                        case 'UpdateNodePeer':
                              var msg = {}
                              msg['account_id'] = eventData.AccountId
                              msg['node'] = {
                                    'tea_id': eventData.Node.TeaId,
                                    'peers': eventData.Node.Peers
                              }

                              console.log(JSON.stringify(msg))
                              nc.publish(`layer1.event.${event.section}.${event.method}`, JSON.stringify(msg))
                              break
                        case 'NewNodeJoined':
                              var msg = {}
                              msg['account_id'] = eventData.AccountId
                              msg['tea_id'] = eventData.Node.TeaId

                              console.log(JSON.stringify(msg))
                              nc.publish(`layer1.event.${event.section}.${event.method}`, JSON.stringify(msg))
                              break
                        case 'CompleteTask':
                              var msg = {}
                              msg['account_id'] = eventData.AccountId
                              msg['ref_num'] = eventData.Task.ref_num
                              msg['rsa_pub'] = eventData.Task.rsa_pub
                              msg['cap_cid'] = eventData.Task.cap_cid
                              msg['model_cid'] = eventData.Task.model_cid
                              msg['data_cid'] = eventData.Task.data_cid
                              msg['payment'] = eventData.Task.payment

                              console.log(JSON.stringify(msg))
                              nc.publish(`layer1.event.${event.section}.${event.method}`, JSON.stringify(msg))
                              break
                        default:
                  }
            }
      });
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

main().catch((error) => {
      console.error(error)
      process.exit(-1)
})