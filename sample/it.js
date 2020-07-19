const toHex = require('to-hex');
const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types');
const rpc = require('../src/rpc');
const NATS = require('nats');
const proto = require('../src/proto');

const nc = NATS.connect();

function update_node_profile() {
      let nodeProfile = {
            ephemeralPublicKey: Buffer.from('c7e016fad0796bb68594e49a6ef1942cf7e73497e69edb32d19ba2fab3696597', 'hex'),
            profileCid: 'Q3NGI0NzQyNTc0YTcxND',
            teaId: Buffer.from('c7e016fad0796bb68594e49a6ef1942cf7e73497e69edb32d19ba2fab3696596', 'hex'),
            publicUrls: ['tearust.com', 'tearust.io'],
      }

      const updateProfileRequest = {
            nodeProfile,
            signature: Buffer.from('666', 'hex'),
      }

      const buf = new proto.RAProtobuf('TeaNodeUpdateProfileRequest');
      buf.payload(updateProfileRequest);
      const requestBase64 = Buffer.from(buf.toBuffer()).toString('base64');
      console.log("TeaNodeUpdateProfileRequest Base64", requestBase64);

      nc.publish('layer1.async.reply.update_node_profile', requestBase64, 'layer1.test.result')
}

function add_new_task() {
      const task = {
            refNum: Buffer.from('0c6123c17c95bd6617a01ef899f5895ddb190eb3265f341687f4c0ad1b1f366f', 'hex'),
            delegateId: Buffer.from('e9889b1c54ccd6cf184901ded892069921d76f7749b6f73bed6cf3b9be1a8a44', 'hex'),
            modelCid: 'QmfL6ry4YRKD4joa3RMQZ1qYGKGBWJqHYtEiJEjBmQrASB',
            bodyCid: '9f58',
            payment: 1000,
      }
      const taskBuf = new proto.DelegateProtobuf('AddNewTaskRequest');
      taskBuf.payload({ task });

      const taskBufBase64 = Buffer.from(taskBuf.toBuffer()).toString('base64');

      // const protoMsg = Buffer.from(taskBuf, 'base64');
      // const newTaskBuf = new proto.DelegateProtobuf('AddNewTaskRequest');
      // const newTask = newTaskBuf.decode(protoMsg);
      // console.log('3', newTask);

      nc.publish('layer1.async.reply.add_new_task', taskBufBase64, 'layer1.test.result')
}

function complete_task() {
      const completeTaskRequest = {
            refNum: Buffer.from('0c6123c17c95bd6617a01ef899f5895ddb190eb3265f341687f4c0ad1b1f366f', 'hex'),
            teaId: Buffer.from('e9889b1c54ccd6cf184901ded892069921d76f7749b6f73bed6cf3b9be1a8a44', 'hex'),
            delegateSig: Buffer.from('577ca5104490756b320da325aa81e272049fcee7bb63fe1f92220201a15c47025e3032b85366fcf85b3a2f24418a933b9d6c4fcd94e145b783e2364980a93c0d', 'hex'),
            result: Buffer.from('e9889b1c54ccd6cf184901ded892069921d76f7749b6f73bed6cf3b9be1a8a440c6123c17c95bd6617a01ef899f5895ddb190eb3265f341687f4c0ad1b1f366f', 'hex'),
            resultSig: Buffer.from('577ca5104490756b320da325aa81e272049fcee7bb63fe1f92220201a15c47025e3032b85366fcf85b3a2f24418a933b9d6c4fcd94e145b783e2364980a93c0d', 'hex'),
      }

      const requestBuf = new proto.DelegateProtobuf('CompleteTaskRequest');
      requestBuf.payload(completeTaskRequest);
      const requestBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64');
      console.log("CompleteTaskRequest Base64", requestBase64);

      // const newRequestBuf = new proto.DelegateProtobuf('CompleteTaskRequest');
      // const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'));
      // console.log('decode:', newRequest);

      nc.publish('layer1.async.reply.complete_task', requestBase64, 'layer1.test.result')
}

function test_action() {
      update_node_profile();

      nc.subscribe('layer1.event.*.>', (msg, reply, subject, sid) => {
            console.log('Received a message: ', msg, reply, subject, sid)
            const subSections = subject.split('.');

            switch (subSections[3]) {
                  case 'UpdateNodeProfile':
                        add_new_task();
                        break
                  case 'NewTaskAdded':
                        complete_task();
                        break
                  case 'CompleteTask':
                        console.log('Good !!!');

                        lookup_node_profile();
                        break
                  default:

            }
      })
}

function lookup_node_profile() {
      const requestBase64 = Buffer.from('c7e016fad0796bb68594e49a6ef1942cf7e73497e69edb32d19ba2fab3696591', 'hex').toString('base64');
      console.log("EphemeralId Base64", requestBase64);

      nc.publish('layer1.async.replay.lookup_node_profile', requestBase64, 'layer1.test.result')
}

async function test_rpc(api) {
      // const r = await api.rpc.tea.getSum();
      // let ephemeralId = api.createType('TeaPubKey', '0x2754d7e9c73ced5b302e12464594110850980027f8f83c469e8145eef59220b7');
      // console.log(ephemeralId);

      let r = await api.rpc.tea.getNodeByEphemeralId('c7e016fad0796bb68594e49a6ef1942cf7e73497e69edb32d19ba2fab3696597');
      // const r = await api.rpc.chain.getBlock("0xca75a528fee95390a0be5f948665e497fe97fd877791d81f42c2b0d2195fa9b9");


      console.log(JSON.stringify(r));

      if (r.isNone) {
            return null;
      }

      return r;
}

async function main() {
      const api = await ApiPromise.create({
            types,
            rpc,
      })

      await cryptoWaitReady()

      const keyring = new Keyring({ type: 'sr25519' });
      const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });

      test_action();
}

main()