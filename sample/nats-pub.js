const assert = require('assert');
const { ApiPromise } = require('@polkadot/api');
const NATS = require('nats');
const proto = require('../src/proto');

const nc = NATS.connect();

function add_new_node() {
      nc.publish('layer1.async.reply.add_new_node', '0x02b40e313842e45574e0ca5b37cb0580cc3378ceb096b562a9828b2137b98f5f', 'layer1.test.result')
}

function update_node_profile() {
      let nodeProfile = {
            ephemeralPublicKey: Buffer.from('111', 'hex'),
            profileCid: '222',
            teaId: Buffer.from('c7e016fad0796bb68594e49a6ef1942cf7e73497e69edb32d19ba2fab3696596', 'hex'),
            publicUrls: ['1','2'],
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

function get_nodes() {
      nc.publish('layer1.async.reply.get_nodes', '', 'layer1.test.result')
}

function add_new_task() {
      const task = {
            refNum: Buffer.from('01', 'hex'),
            delegateId: Buffer.from('01', 'hex'),
            modelCid: '444',
            bodyCid: '555',
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
            result: Buffer.from('0xe9889b1c54ccd6cf184901ded892069921d76f7749b6f73bed6cf3b9be1a8a440c6123c17c95bd6617a01ef899f5895ddb190eb3265f341687f4c0ad1b1f366f', 'hex'),
            resultSig: Buffer.from('44', 'hex'),
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

function add_new_data() {
      const data = {
            delegatorEphemeralId: Buffer.from('01', 'hex'),
            deploymentId: '777',
            dataCid: '888',
            descriptionCid: '999',
            capCid: '000'
      }
      const dataBuf = new proto.DelegateProtobuf('AddNewDataRequest');
      dataBuf.payload({ data });

      const dataBufBase64 = Buffer.from(dataBuf.toBuffer()).toString('base64');

      // const protoMsg = Buffer.from(dataBuf, 'base64');
      // const newTaskBuf = new proto.DelegateProtobuf('AddNewTaskRequest');
      // const newTask = newTaskBuf.decode(protoMsg);
      // console.log('3', newTask);

      nc.publish('layer1.async.reply.add_new_data', dataBufBase64, 'layer1.test.result')
}

function settle_accounts() {
      const settleAccountsRequest = {
            employer: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
            delegatorEphemeralId: Buffer.from('01', 'hex'),
            errandUuid: '03',
            payment: 900,
            paymentType: 1,
            employerSignature: Buffer.from('04', 'hex'),
            executorEphemeralId: Buffer.from('05', 'hex'),
            expiredTime: 6,
            delegateSignature: Buffer.from('07', 'hex'),
            resultCid: '08',
            executorSingature: Buffer.from('09', 'hex'),
      }
      const requestBuf = new proto.DelegateProtobuf('SettleAccountsRequest');
      requestBuf.payload(settleAccountsRequest);
      const requestBufBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64');

      nc.publish('layer1.async.reply.settle_accounts', requestBufBase64, 'layer1.event.result');
}

async function main() {
      // add_new_node()
      // update_node_profile()
      // get_nodes()
      // add_new_task()
      // complete_task()
      // update_node_profile()
      // add_new_data()
      settle_accounts()
}

main().catch((error) => {
      console.error(error)
      process.exit(-1)
})