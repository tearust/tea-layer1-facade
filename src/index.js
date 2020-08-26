const NATS = require('nats')
const { ApiPromise, WsProvider, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const _ = require('lodash');
const proto = require('./proto');
const toHex = require('to-hex');
const types = require('./types');
const rpc = require('./rpc');
const BN = require('bn.js');

const natsUrl = process.env.NATS_URL || "127.0.0.1:4222";
const nc = NATS.connect(natsUrl, {
      waitOnFirstConnect: true,
});

const cache = {
      latest_block_height : 0,
      latest_block_hash: '',

      peer_url_list: []
};

function sleep (time) {
      return new Promise((resolve) => setTimeout(resolve, time));
}

async function main() {
      const wsProvider = new WsProvider(process.env.FACADE_WSURL || 'ws://127.0.0.1:9944');
      let api = {}
      while(true) {
            try {
                  api = await ApiPromise.create({
                        provider: wsProvider,
                        types,
                        rpc
                  });
                  break;
            } catch (e) {
                 console.log("Try reconnect ...");
                 await sleep(2000);
            }
      }

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
            // console.log('Received a message: ', msg, reply, subject, sid)
            const subSections = subject.split('.')
            // console.log(subSections)
            if (subSections.length < 4) {
                  console.log('invalid subject')
                  return
            }
            const replyTo = subSections[2]
            const action = subSections[3]
                  
            const keyring = new Keyring({ type: 'sr25519' });

            let account = process.env.FACADE_ACCOUNT || 'Alice';
            const ac = keyring.addFromUri(`//${account}`, { name: `${account} default` });

            switch(action) {
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
                        await transfer(api, ac, subMsgs[0], parseInt(subMsgs[1]));
                        console.log('send transfer');
                        break
                  case 'add_new_node':
                        var teaId = msg
                        await api.tx.tea.addNewNode(teaId)
                              .signAndSend(ac, ({ events = [], status }) => {
                                    if (status.isInBlock) {
                                          console.log('Add new node with teaId ' + teaId);
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
                  case 'update_node_profile':
                        const uProtoMsg = Buffer.from(msg, 'base64');
                        const updateProfileBuf = new proto.RAProtobuf('TeaNodeUpdateProfileRequest');
                        const updateProfile = updateProfileBuf.decode(uProtoMsg);
                        // console.log(updateProfile);
                        
                        var teaId = toHex(updateProfile.nodeProfile.teaId, { addPrefix: true });
                        var ephemeralPublicKey = toHex(updateProfile.nodeProfile.ephemeralPublicKey, { addPrefix: true });
                        let profileCid = toHex(Buffer.from(updateProfile.nodeProfile.profileCid), { addPrefix: true });
                        let publicUrls = [];
                        updateProfile.nodeProfile.publicUrls.forEach((url, i) => {
                              publicUrls.push(toHex(Buffer.from(url), { addPrefix: true }))
                        });
                        let signature = toHex(Buffer.from(updateProfile.signature), { addPrefix: true })
                        let peerId = toHex(Buffer.from(updateProfile.nodeProfile.peerId), { addPrefix: true })

                        await api.tx.tea.updateNodeProfile(teaId, ephemeralPublicKey, profileCid, publicUrls, peerId, signature)
                              .signAndSend(ac, ({ events = [], status }) => {
                                    if (status.isInBlock) {
                                          console.log('Update node profile with teaId ' + teaId);
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
                        var protoMsg = Buffer.from(msg, 'base64');
                        const newTaskBuf = new proto.DelegateProtobuf('AddNewTaskRequest');
                        const newTask = newTaskBuf.decode(protoMsg);
                        // console.log(newTask);
                        
                        var refNum = toHex(newTask.task.refNum, { addPrefix: true });
                        var delegateId = toHex(newTask.task.delegateId, { addPrefix: true });
                        // console.log(delegateId);
                        let modelCid = toHex(Buffer.from(newTask.task.modelCid), { addPrefix: true });
                        let payment = newTask.task.payment;
                        let bodyCid = toHex(Buffer.from(newTask.task.bodyCid), { addPrefix: true })

                        await api.tx.tea.addNewTask(refNum, delegateId, modelCid, payment, bodyCid)
                              .signAndSend(ac, ({ events = [], status }) => {
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
                        const newRequestBuf = new proto.DelegateProtobuf('CompleteTaskRequest');
                        const newRequest = newRequestBuf.decode(Buffer.from(msg, 'base64'));

                        var refNum = toHex(newRequest.refNum, { addPrefix: true });
                        var teaId = toHex(newRequest.teaId, { addPrefix: true });
                        let delegateSig = toHex(Buffer.from(newRequest.delegateSig), { addPrefix: true });
                        let result = toHex(Buffer.from(newRequest.result), { addPrefix: true });
                        let resultSig = toHex(Buffer.from(newRequest.resultSig), { addPrefix: true });

                        await api.tx.tea.completeTask(refNum, teaId, delegateSig, result, resultSig)
                              .signAndSend(ac, ({ events = [], status }) => {
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
                  case 'lookup_node_profile':
                        {
                              const ephemeralId = Buffer.from(msg, 'base64').toString('hex');
                              const nodeObj = await api.rpc.tea.getNodeByEphemeralId(ephemeralId);
                              let node = nodeObj.toJSON();

                              if (node == null) {
                                    nc.publish(reply, "node_is_not_exist");
                                    break
                              }
                              let urls = []
                              if (node.urls) {
                                    node.urls.forEach((url, i) => {
                                          urls.push(Buffer.from(url.slice(2), 'hex').toString());
                                    })
                              }
                              const nodeProfile = {
                                    ephemeralPublicKey: Buffer.from(node.ephemeralId.slice(2), 'hex'),
                                    profileCid: Buffer.from(node.profileCid.slice(2), 'hex').toString(),
                                    teaId: Buffer.from(node.teaId.slice(2), 'hex'),
                                    publicUrls: urls,
                                    peerId: Buffer.from(node.peerId.slice(2), 'hex').toString(),
                              }
                              console.log('Lookup node profile:', JSON.stringify(nodeProfile));
                              const nodeBuf = new proto.RAProtobuf('NodeProfile');
                              nodeBuf.payload(nodeProfile);
                              const nodeBase64 = Buffer.from(nodeBuf.toBuffer()).toString('base64');
                              console.log("NodeBase64:", nodeBase64);

                              nc.publish(reply, nodeBase64);
                        }
                        break
                  case 'node_profile_by_tea_id':
                        let nodeObj = await api.query.tea.nodes(msg)
                        if (nodeObj.isNone) {
                              nodeObj = await api.query.tea.bootstrapNodes(msg)
                        }
                        let node = nodeObj.toJSON();

                        if (node == null) {
                              nc.publish(reply, "node_is_not_exist");
                              break
                        }
                        let urls = []
                        if (node.urls) {
                              node.urls.forEach((url, i) => {
                                    urls.push(Buffer.from(url.slice(2), 'hex').toString());
                              })
                        }
                        const nodeProfile = {
                              ephemeralPublicKey: Buffer.from(node.ephemeralId.slice(2), 'hex'),
                              profileCid: Buffer.from(node.profileCid.slice(2), 'hex').toString(),
                              teaId: Buffer.from(node.teaId.slice(2), 'hex'),
                              publicUrls: urls,
                              peerId: Buffer.from(node.peerId.slice(2), 'hex').toString(),
                        }
                        console.log('Lookup node profile:', JSON.stringify(nodeProfile));
                        const nodeBuf = new proto.RAProtobuf('NodeProfile');
                        nodeBuf.payload(nodeProfile);
                        const nodeBase64 = Buffer.from(nodeBuf.toBuffer()).toString('base64');
                        console.log("NodeBase64:", nodeBase64);

                        nc.publish(reply, nodeBase64);
                        break
                  case 'add_new_data':
                        var protoMsg = Buffer.from(msg, 'base64');
                        const newDataBuf = new proto.DelegateProtobuf('AddNewDataRequest');
                        const newData = newDataBuf.decode(protoMsg);
                        console.log(newData);
                        
                        var delegatorEphemeralId = toHex(newData.data.delegatorEphemeralId, { addPrefix: true });
                        var deploymentId = toHex(Buffer.from(newData.data.deploymentId), { addPrefix: true });
                        let dataCid = toHex(Buffer.from(newData.data.dataCid), { addPrefix: true });
                        let descriptionCid = toHex(Buffer.from(newData.data.descriptionCid), { addPrefix: true })
                        let capCid = toHex(Buffer.from(newData.data.capCid), { addPrefix: true })

                        await api.tx.tea.addNewData(delegatorEphemeralId, deploymentId, dataCid, descriptionCid, capCid)
                              .signAndSend(ac, ({ events = [], status }) => {
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
                        console.log('send add_new_data tx')
                        break
                  case 'settle_accounts':
                        {
                              const yi = new BN('100000000', 10);
                              const million = new BN('10000000', 10);
                              const unit = yi.mul(million);

                              const protoMsg = Buffer.from(msg, 'base64');
                              const newRequestBuf = new proto.DelegateProtobuf('SettleAccountsRequest');
                              const newRequest = newRequestBuf.decode(protoMsg);
                              console.log(newRequest);
                              
                              const employer = newRequest.employer;
                              const delegatorEphemeralId = toHex(newRequest.delegatorEphemeralId, { addPrefix: true });
                              const errandUuid = toHex(Buffer.from(newRequest.errandUuid), { addPrefix: true });
                              const payment = parseInt(newRequest.payment, 10) * unit;
                              const paymentType = newRequest.paymentType;
                              const employerSignature = toHex(newRequest.employerSignature, { addPrefix: true });
                              const executorEphemeralId = toHex(newRequest.executorEphemeralId, { addPrefix: true });
                              const expiredTime = newRequest.expiredTime;
                              const delegateSignature = toHex(newRequest.delegateSignature, { addPrefix: true });
                              const resultCid = toHex(Buffer.from(newRequest.resultCid), { addPrefix: true });
                              const executorSingature = toHex(newRequest.executorSingature, { addPrefix: true });
      
                              await api.tx.tea.settleAccounts(
                                    employer,
                                    delegatorEphemeralId,
                                    errandUuid,
                                    payment.toString(),
                                    paymentType,
                                    employerSignature,
                                    executorEphemeralId,
                                    expiredTime,
                                    delegateSignature,
                                    resultCid,
                                    executorSingature)
                                    .signAndSend(ac, ({ events = [], status }) => {
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
                              console.log('send deposit tx')
                        }
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
                  console.log('eventData:', JSON.stringify(eventData));
                  
                  switch (event.method) {
                        case 'NewTaskAdded':
                              const task = {
                                    refNum: Buffer.from(eventData.Task.refNum, 'hex'),
                                    delegateId: Buffer.from(eventData.Task.delegateTeaId, 'hex'),
                                    modelCid: eventData.Task.modelCid.toString(),
                                    bodyCid: Buffer.from(eventData.Task.bodyCid, 'hex').toString(),
                                    payment: parseInt(eventData.Task.payment),
                              }
                              const response = {
                                    accountId: Buffer.from(eventData.AccountId, 'hex'),
                                    task,
                              }

                              console.log('response:', JSON.stringify(response));
                              const responseBuf = new proto.DelegateProtobuf('AddNewTaskResponse');
                              responseBuf.payload(response);
                              const newTaskResponseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64');
                              console.log("TaskResponseBase64:", newTaskResponseBase64);

                              nc.publish(`layer1.event.${event.section}.${event.method}`, newTaskResponseBase64)
                              break
                        case 'NewModelAdded':
                              var msg = {}
                              msg['account_id'] = eventData.AccountId

                              console.log(JSON.stringify(msg))
                              nc.publish(`layer1.event.${event.section}.${event.method}`, JSON.stringify(msg))
                              break
                        case 'UpdateNodeProfile':
                              var msg = {}
                              msg['account_id'] = eventData.AccountId
                              msg['node'] = {
                                    'tea_id': eventData.Node.teaId,
                                    'peers': eventData.Node.peers
                              }

                              console.log(JSON.stringify(msg))
                              nc.publish(`layer1.event.${event.section}.${event.method}`, JSON.stringify(msg))
                              break
                        case 'NewNodeJoined':
                              var msg = {}
                              msg['account_id'] = eventData.AccountId
                              msg['tea_id'] = eventData.Node.teaId

                              console.log(JSON.stringify(msg))
                              nc.publish(`layer1.event.${event.section}.${event.method}`, JSON.stringify(msg))
                              break
                        case 'CompleteTask':
                              const completeTaskResponse = {
                                    refNum: Buffer.from(eventData.RefNum, 'hex'),
                                    accountId: Buffer.from(eventData.AccountId, 'hex'),
                                    result: Buffer.from(eventData.Result, 'hex'),
                              }
                  
                              const responseBu = new proto.DelegateProtobuf('CompleteTaskResponse');
                              responseBu.payload(completeTaskResponse);
                              const responseBase64 = Buffer.from(responseBu.toBuffer()).toString('base64');
                              console.log("responseBase64", responseBase64);

                              nc.publish(`layer1.event.${event.section}.${event.method}`, responseBase64)
                              break
                        case 'NewDataAdded':
                              const data = {
                                    delegatorEphemeralId: Buffer.from(eventData.Data.delegatorEphemeralId, 'hex'),
                                    deploymentId: Buffer.from(eventData.Data.deploymentId, 'hex').toString(),
                                    dataCid: Buffer.from(eventData.Data.cid, 'hex').toString(),
                                    descriptionCid: Buffer.from(eventData.Data.description, 'hex').toString(),
                                    capCid: Buffer.from(eventData.Data.capChecker, 'hex').toString(),
                              }

                              const newDataResponse = {
                                    accountId: Buffer.from(eventData.AccountId, 'hex'),
                                    data,
                              }

                              console.log('newDataResponse:', JSON.stringify(newDataResponse));
                              const newDataResponseBuf = new proto.DelegateProtobuf('AddNewDataResponse');
                              newDataResponseBuf.payload(newDataResponse);
                              const newDataResponseBase64 = Buffer.from(newDataResponseBuf.toBuffer()).toString('base64');
                              console.log("DataResponseBase64:", newDataResponseBase64);

                              nc.publish(`layer1.event.${event.section}.${event.method}`, newDataResponseBase64)
                              break
                        case 'SettleAccounts':
                        {
                              const settleAccountsResponse = {
                                    accountId: Buffer.from(eventData.AccountId, 'hex'),
                                    employer: eventData.Bill.employer.toString(),
                                    delegatorEphemeralId: Buffer.from(eventData.Bill.delegatorEphemeralId, 'hex'),
                                    errandUuid: Buffer.from(eventData.Bill.errandUuid, 'hex').toString(),
                                    payment: parseInt(eventData.Bill.payment, 10),
                                    paymentType: parseInt(eventData.Bill.paymentType),
                                    executorEphemeralId: Buffer.from(eventData.Bill.executorEphemeralId, 'hex'),
                                    expiredTime: parseInt(eventData.Bill.expiredTime),
                                    resultCid: Buffer.from(eventData.Bill.resultCid, 'hex').toString(),
                              }
                              console.log('settleAccountsResponse:', JSON.stringify(settleAccountsResponse));
                  
                              const responseBuf = new proto.DelegateProtobuf('SettleAccountsResponse');
                              responseBuf.payload(settleAccountsResponse);
                              const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64');
                              console.log("SettleAccountsResponse Base64", responseBase64);

                              nc.publish(`layer1.event.${event.section}.${event.method}`, responseBase64)
                        }
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