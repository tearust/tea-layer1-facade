/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
const assert = require('assert')
const { ApiPromise } = require('@polkadot/api')
const NATS = require('nats')
const proto = require('../src/proto')

const nc = NATS.connect()

function update_node_profile () {
  const updateProfileRequest = {
    teaId: Buffer.from('0111', 'hex'),
    ephemeralPublicKey: Buffer.from('1111', 'hex'),
    profileCid: '2222',
    publicUrls: ['1', '2'],
    peerId: 'QmZzcViy4RvG7m1yVqjfGQ8HPmrM3Kk2MhodTRue2ZTGfh',
    signature: Buffer.from('777', 'hex')
  }

  const buf = new proto.RAProtobuf('TeaNodeUpdateProfileRequest')
  buf.payload(updateProfileRequest)
  const requestBase64 = Buffer.from(buf.toBuffer()).toString('base64')
  console.log('TeaNodeUpdateProfileRequest Base64', requestBase64)

  nc.publish('layer1.async.reply.update_node_profile', requestBase64, 'layer1.test.result')
}

function get_nodes () {
  nc.publish('layer1.async.reply.get_nodes', '', 'layer1.test.result')
}

function add_new_data () {
  const data = {
    delegatorEphemeralId: Buffer.from('01', 'hex'),
    deploymentId: '777',
    dataCid: '888',
    descriptionCid: '999',
    capCid: '000'
  }
  const dataBuf = new proto.DelegateProtobuf('AddNewDataRequest')
  dataBuf.payload({ data })

  const dataBufBase64 = Buffer.from(dataBuf.toBuffer()).toString('base64')

  // const protoMsg = Buffer.from(dataBuf, 'base64');
  // const newTaskBuf = new proto.DelegateProtobuf('AddNewTaskRequest');
  // const newTask = newTaskBuf.decode(protoMsg);
  // console.log('3', newTask);

  nc.publish('layer1.async.reply.add_new_data', dataBufBase64, 'layer1.test.result')
}

function settle_accounts () {
  const bill1 = {
    accountId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    payment: 10
  }
  const bill2 = {
    accountId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    payment: 20
  }
  const settleAccountsRequest = {
    employer: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    delegatorTeaId: Buffer.from('01', 'hex'),
    delegatorEphemeralId: Buffer.from('01', 'hex'),
    errandUuid: '03',
    errandJsonCid: '04',
    bills: [bill1, bill2],
    employerSignature: Buffer.from('04', 'hex'),
    executorEphemeralId: Buffer.from('05', 'hex'),
    expiredTime: 6,
    delegateSignature: Buffer.from('07', 'hex'),
    resultCid: '08',
    executorSingature: Buffer.from('09', 'hex')
  }
  const requestBuf = new proto.DelegateProtobuf('SettleAccountsRequest')
  requestBuf.payload(settleAccountsRequest)
  const requestBufBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64')

  nc.publish('layer1.async.reply.settle_accounts', requestBufBase64, 'layer1.event.result')
}

function deposit_info () {
  const depositInfoRequest = {
    accountId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    delegatorTeaId: Buffer.from('421f50f4c91e66d0c2c18ccfdbef9480741a3c7eb189fc45a2e18ae3ee1b185f', 'hex')
  }
  const requestBuf = new proto.DelegateProtobuf('DepositInfoRequest')
  requestBuf.payload(depositInfoRequest)
  const requestBufBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64')

  nc.publish('layer1.async.reply.deposit_info', requestBufBase64, 'layer1.event.result')
}

function lookup_node_profile () {
  const requestBase64 = Buffer.from('1111', 'hex').toString('base64')
  console.log('EphemeralId Base64', requestBase64)

  nc.publish('layer1.async.reply.lookup_node_profile', requestBase64, 'layer1.event.result')
}

function node_profile_by_tea_id () {
  const requestBase64 = Buffer.from('0111', 'hex').toString('base64')
  console.log('TeaId Base64', requestBase64)

  nc.publish('layer1.async.reply.node_profile_by_tea_id', requestBase64, 'layer1.event.result')
}

function add_new_node () {
  const addNewNodeRequest = {
    teaId: Buffer.from('0111', 'hex')
  }

  const requestBuf = new proto.DelegateProtobuf('AddNewNodeRequest')
  requestBuf.payload(addNewNodeRequest)
  const requestBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64')
  console.log('AddNewNodeRequest Base64', requestBase64)

  nc.publish('layer1.async.reply.add_new_node', requestBase64, 'layer1.event.result')
}

function commit_ra_result () {
  const commitRaRequest = {
    teaId: Buffer.from('c7e016fad0796bb68594e49a6ef1942cf7e73497e69edb32d19ba2fab3696596', 'hex'),
    targetTeaId: Buffer.from('0111', 'hex'),
    isPass: true,
    signature: Buffer.from('2222', 'hex')
  }

  const requestBuf = new proto.RAProtobuf('CommitRaResultRequest')
  requestBuf.payload(commitRaRequest)
  const requestBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64')
  console.log('CommitRaResultRequest Base64', requestBase64)

  nc.publish('layer1.async.reply.commit_ra_result', requestBase64, 'layer1.event.result')
}

async function main () {
  // add_new_node()
  //   update_node_profile()
  // get_nodes()
  // add_new_data()
  // settle_accounts()
  // deposit_info()
  // lookup_node_profile()
  // node_profile_by_tea_id()
  commit_ra_result()
}

main().catch((error) => {
  console.error(error)
  process.exit(-1)
})
