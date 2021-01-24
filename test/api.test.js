/* eslint-disable no-undef */
const assert = require('assert')
const proto = require('../src/proto')

describe('delegate protobuf test suit', () => {
  const task = {
    refNum: Buffer.from('01', 'hex'),
    delegateId: Buffer.from('02', 'hex'),
    modelCid: '444',
    bodyCid: '555',
    payment: 1000
  }

  it('AddNewTaskRequest test', () => {
    const taskBuf = new proto.DelegateProtobuf('AddNewTaskRequest')
    taskBuf.payload({ task })
    const taskBufBase64 = Buffer.from(taskBuf.toBuffer()).toString('base64')

    const newTaskBuf = new proto.DelegateProtobuf('AddNewTaskRequest')
    const newTask = newTaskBuf.decode(Buffer.from(taskBufBase64, 'base64'))
    // console.log('decode:', newTask);
    assert.deepEqual({ task }, newTask)
  })

  it('AddNewTaskResponse test', () => {
    const addNewTaskResponse = {
      accountId: Buffer.from('1234567', 'hex'),
      task
    }

    const responseBuf = new proto.DelegateProtobuf('AddNewTaskResponse')
    responseBuf.payload(addNewTaskResponse)
    const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64')
    console.log('AddNewTaskResponse Base64', responseBase64)

    const newResponseBuf = new proto.DelegateProtobuf('AddNewTaskResponse')
    const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'))
    // console.log('decode:', newResponse);
    assert.deepEqual(addNewTaskResponse, newResponse)
  })

  it('CompleteTaskRequest test', () => {
    const completeTaskRequest = {
      refNum: Buffer.from('111', 'hex'),
      teaId: Buffer.from('01', 'hex'),
      delegateSig: Buffer.from('222', 'hex'),
      result: Buffer.from('333', 'hex'),
      resultSig: Buffer.from('444', 'hex')
    }

    const requestBuf = new proto.DelegateProtobuf('CompleteTaskRequest')
    requestBuf.payload(completeTaskRequest)
    const requestBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64')
    console.log('CompleteTaskRequest Base64', requestBase64)

    const newRequestBuf = new proto.DelegateProtobuf('CompleteTaskRequest')
    const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'))
    // console.log('decode:', newRequest);
    assert.deepEqual(completeTaskRequest, newRequest)
  })

  it('CompleteTaskResponse test', () => {
    const completeTaskResponse = {
      refNum: Buffer.from('222', 'hex'),
      accountId: Buffer.from('111', 'hex'),
      result: Buffer.from('333', 'hex')
    }

    const responseBuf = new proto.DelegateProtobuf('CompleteTaskResponse')
    responseBuf.payload(completeTaskResponse)
    const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64')
    console.log('CompleteTaskResponse Base64', responseBase64)

    const newResponseBuf = new proto.DelegateProtobuf('CompleteTaskResponse')
    const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'))
    // console.log('decode:', newResponse);
    assert.deepEqual(completeTaskResponse, newResponse)
  })

  const data = {
    delegatorEphemeralId: Buffer.from('01', 'hex'),
    deploymentId: '777',
    dataCid: '888',
    descriptionCid: '999',
    capCid: '000'
  }

  it('AddNewDataRequest test', () => {
    const dataBuf = new proto.DelegateProtobuf('AddNewDataRequest')
    dataBuf.payload({ data })
    const dataBufBase64 = Buffer.from(dataBuf.toBuffer()).toString('base64')

    const newDataBuf = new proto.DelegateProtobuf('AddNewDataRequest')
    const newData = newDataBuf.decode(Buffer.from(dataBufBase64, 'base64'))
    // console.log('decode:', newData);
    assert.deepEqual({ data }, newData)
  })

  it('AddNewDataResponse test', () => {
    const addNewDataResponse = {
      accountId: Buffer.from('1234567', 'hex'),
      data
    }

    const responseBuf = new proto.DelegateProtobuf('AddNewDataResponse')
    responseBuf.payload(addNewDataResponse)
    const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64')
    console.log('AddNewDataResponse Base64', responseBase64)

    const newResponseBuf = new proto.DelegateProtobuf('AddNewDataResponse')
    const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'))
    // console.log('decode:', newResponse);
    assert.deepEqual(addNewDataResponse, newResponse)
  })

  it('DepositInfoRequest test', () => {
    const depositInfoRequest = {
      accountId: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      delegatorTeaId: Buffer.from('01', 'hex')
    }
    const requestBuf = new proto.DelegateProtobuf('DepositInfoRequest')
    requestBuf.payload(depositInfoRequest)
    const requestBufBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64')

    const newRequestBuf = new proto.DelegateProtobuf('DepositInfoRequest')
    const newRequest = newRequestBuf.decode(Buffer.from(requestBufBase64, 'base64'))
    // console.log('decode:', newRequest);
    assert.deepEqual(depositInfoRequest, newRequest)
  })

  it('DepositInfoResponse test', () => {
    const depositInfoResponse = {
      accountId: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      delegatorTeaId: Buffer.from('01', 'hex'),
      delegatorEphemeralId: Buffer.from('02', 'hex'),
      delegatorSignature: Buffer.from('03', 'hex'),
      amount: 1000,
      expiredTime: 10000
    }

    const responseBuf = new proto.DelegateProtobuf('DepositInfoResponse')
    responseBuf.payload(depositInfoResponse)
    const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64')
    console.log('DepositInfoResponse Base64', responseBase64)

    const newResponseBuf = new proto.DelegateProtobuf('DepositInfoResponse')
    const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'))
    // console.log('decode:', newResponse);
    newResponse.amount = parseInt(newResponse.amount, 10)
    newResponse.expiredTime = parseInt(newResponse.expiredTime, 10)

    assert.deepEqual(depositInfoResponse, newResponse)
  })

  const bill1 = {
    accountId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    payment: 10
  }
  const bill2 = {
    accountId: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    payment: 20
  }

  it('SettleAccountsRequest test', () => {
    const settleAccountsRequest = {
      employer: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      delegatorTeaId: Buffer.from('01', 'hex'),
      delegatorEphemeralId: Buffer.from('02', 'hex'),
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

    const newRequestBuf = new proto.DelegateProtobuf('SettleAccountsRequest')
    const newRequest = newRequestBuf.decode(Buffer.from(requestBufBase64, 'base64'))
    newRequest.expiredTime = parseInt(newRequest.expiredTime, 10)
    // console.log('decode:', newRequest);
    // newRequest.payment
    assert.deepEqual(settleAccountsRequest, newRequest)
  })

  it('SettleAccountsResponse test', () => {
    const settleAccountsResponse = {
      accountId: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      delegatorTeaId: Buffer.from('01', 'hex'),
      employer: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      delegatorEphemeralId: Buffer.from('02', 'hex'),
      errandUuid: '03',
      errandJsonCid: '04',
      bills: [bill1, bill2],
      executorEphemeralId: Buffer.from('05', 'hex'),
      expiredTime: 6,
      resultCid: '08'
    }

    const responseBuf = new proto.DelegateProtobuf('SettleAccountsResponse')
    responseBuf.payload(settleAccountsResponse)
    const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64')
    console.log('SettleAccountsResponse Base64', responseBase64)

    const newResponseBuf = new proto.DelegateProtobuf('SettleAccountsResponse')
    const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'))
    newResponse.expiredTime = parseInt(newResponse.expiredTime, 10)

    // console.log('decode:', newResponse);
    assert.deepEqual(settleAccountsResponse, newResponse)
  })

  it('AddNewNodeRequest test', () => {
    const addNewNodeRequest = {
      teaId: Buffer.from('000', 'hex')
      // peerId: '111',
    }

    const requestBuf = new proto.DelegateProtobuf('AddNewNodeRequest')
    requestBuf.payload(addNewNodeRequest)
    const requestBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64')
    console.log('AddNewNodeRequest Base64', requestBase64)

    const newRequestBuf = new proto.DelegateProtobuf('AddNewNodeRequest')
    const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'))
    // console.log('decode:', newRequest);
    assert.deepEqual(addNewNodeRequest, newRequest)
  })

  it('AddNewNodeResponse test', () => {
    const addNewNodeResponse = {
      accountId: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      teaId: Buffer.from('000', 'hex')
    }

    const responseBuf = new proto.DelegateProtobuf('AddNewNodeResponse')
    responseBuf.payload(addNewNodeResponse)
    const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64')
    console.log('AddNewNodeResponse Base64', responseBase64)

    const newResponseBuf = new proto.DelegateProtobuf('AddNewNodeResponse')
    const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'))
    // console.log('decode:', newResponse);
    // newResponse.createTime = parseInt(newResponse.createTime, 10);
    assert.deepEqual(addNewNodeResponse, newResponse)
  })

  it('RuntimeActivityRequest test', () => {
    const runtimeActivityRequest = {
      teaId: Buffer.from('000', 'hex')
    }

    const requestBuf = new proto.DelegateProtobuf('RuntimeActivityRequest')
    requestBuf.payload(runtimeActivityRequest)
    const requestBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64')
    console.log('RuntimeActivityRequest Base64', requestBase64)

    const newRequestBuf = new proto.DelegateProtobuf('RuntimeActivityRequest')
    const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'))
    // console.log('decode:', newRequest);
    assert.deepEqual(runtimeActivityRequest, newRequest)
  })

  it('RuntimeActivityResponse test', () => {
    const runtimeActivityResponse = {
      teaId: Buffer.from('000', 'hex'),
      cid: '111',
      updateHeight: 100
    }

    const responseBuf = new proto.DelegateProtobuf('RuntimeActivityResponse')
    responseBuf.payload(runtimeActivityResponse)
    const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64')
    console.log('RuntimeActivityResponse Base64', responseBase64)

    const newResponseBuf = new proto.DelegateProtobuf('RuntimeActivityResponse')
    const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'))
    assert.deepEqual(runtimeActivityResponse, newResponse)
  })

  it('UpdateRuntimeActivity test', () => {
    const updateRuntimeActivity = {
      teaId: Buffer.from('0000', 'hex'),
      cid: Buffer.from('1111', 'hex').toString(),
      ephemeralId: Buffer.from('2222', 'hex'),
      signature: Buffer.from('3333', 'hex')
    }

    const requestBuf = new proto.DelegateProtobuf('UpdateRuntimeActivity')
    requestBuf.payload(updateRuntimeActivity)
    const requestBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64')
    console.log('UpdateRuntimeActivity Base64', requestBase64)

    const newRequestBuf = new proto.DelegateProtobuf('UpdateRuntimeActivity')
    const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'))
    assert.deepEqual(updateRuntimeActivity, newRequest)
  })

  it('UpdateKeyGenerationResult test', () => {

    const deploymentIds = [
          Buffer.from('111', 'hex'),
          Buffer.from('222', 'hex')]
    const updateKeyGenerationResult = {
      taskId: '333',
      delegatorNonce: Buffer.from('444', 'hex'),
      publicKey: Buffer.from('555', 'hex'),
      deploymentIds: deploymentIds,
      multiSigAccount: Buffer.from('666', 'hex'),
    }

    const requestBuf = new proto.DelegateProtobuf('UpdateKeyGenerationResult')
    requestBuf.payload(updateKeyGenerationResult)
    const requestBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64')
    console.log('UpdateKeyGenerationResult Base64', requestBase64)

    const newRequestBuf = new proto.DelegateProtobuf('UpdateKeyGenerationResult')
    const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'))
    assert.deepEqual(updateKeyGenerationResult, newRequest)
  })

  it('UpdateSignTransactionResult test', () => {
    const updateSignTransactionResult = {
      taskId: '111',
      delegatorNonce: Buffer.from('222', 'hex'),
      succeed: true,
    }

    const requestBuf = new proto.DelegateProtobuf('UpdateSignTransactionResult')
    requestBuf.payload(updateSignTransactionResult)
    const requestBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64')
    console.log('UpdateSignTransactionResult Base64', requestBase64)

    const newRequestBuf = new proto.DelegateProtobuf('UpdateSignTransactionResult')
    const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'))
    assert.deepEqual(updateSignTransactionResult, newRequest)
  })
})

describe('ra protobuf test suit', () => {
  const raNodes = [
    {
      teaId: Buffer.from('111', 'hex'),
      isPass: false
    },
    {
      teaId: Buffer.from('222', 'hex'),
      isPass: true
    }
  ]
  const nodeProfile = {
    ephemeralPublicKey: Buffer.from('111', 'hex'),
    profileCid: '222',
    teaId: Buffer.from('333', 'hex'),
    publicUrls: ['1', '2'],
    peerId: 'QmZzcViy4RvG7m1yVqjfGQ8HPmrM3Kk2MhodTRue2ZTGfh',
    raNodes,
    status: 'Pending'
  }

  it('TeaNodeUpdateProfileRequest test', () => {
    const updateProfileRequest = {
      ephemeralPublicKey: Buffer.from('111', 'hex'),
      profileCid: '222',
      teaId: Buffer.from('333', 'hex'),
      publicUrls: ['1', '2'],
      peerId: 'QmZzcViy4RvG7m1yVqjfGQ8HPmrM3Kk2MhodTRue2ZTGfh',
      signature: Buffer.from('777', 'hex')
    }

    const buf = new proto.RAProtobuf('TeaNodeUpdateProfileRequest')
    buf.payload(updateProfileRequest)
    const requestBase64 = Buffer.from(buf.toBuffer()).toString('base64')
    console.log('TeaNodeUpdateProfileRequest Base64', requestBase64)

    const newRequestBuf = new proto.RAProtobuf('TeaNodeUpdateProfileRequest')
    const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'))
    // console.log('decode:', newRequest);
    assert.deepEqual(updateProfileRequest, newRequest)
  })

  it('TeaNodeResponse test', () => {
    const nodeResponse = {
      accountId: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      nodeProfile
    }
    const buf = new proto.RAProtobuf('TeaNodeResponse')
    buf.payload(nodeResponse)
    const base64 = Buffer.from(buf.toBuffer()).toString('base64')
    console.log('TeaNodeResponse Base64', base64)

    const newResponseBuf = new proto.RAProtobuf('TeaNodeResponse')
    const newResponse = newResponseBuf.decode(Buffer.from(base64, 'base64'))
    // console.log('decode:', newResponse);
    assert.deepEqual(nodeResponse, newResponse)
  })

  it('CommitRaResultRequest test', () => {
    const commitRaRequest = {
      teaId: Buffer.from('0000', 'hex'),
      targetTeaId: Buffer.from('1111', 'hex'),
      isPass: true,
      signature: Buffer.from('2222', 'hex')
    }

    const requestBuf = new proto.RAProtobuf('CommitRaResultRequest')
    requestBuf.payload(commitRaRequest)
    const requestBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64')
    console.log('CommitRaResultRequest Base64', requestBase64)

    const newRequestBuf = new proto.RAProtobuf('CommitRaResultRequest')
    const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'))
    // console.log('decode:', newRequest);
    assert.deepEqual(commitRaRequest, newRequest)
  })

  it('CommitRaResultResponse test', () => {
    const commitRaResultResponse = {
      accountId: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      teaId: Buffer.from('0000', 'hex'),
      targetTeaId: Buffer.from('1111', 'hex'),
      isPass: true,
      targetStatus: 'Pending'
    }

    const responseBuf = new proto.RAProtobuf('CommitRaResultResponse')
    responseBuf.payload(commitRaResultResponse)
    const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64')
    console.log('CommitRaResultResponse Base64', responseBase64)

    const newResponseBuf = new proto.RAProtobuf('CommitRaResultResponse')
    const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'))
    // console.log('decode:', newResponse);
    assert.deepEqual(commitRaResultResponse, newResponse)
  })
})

describe('debug', function () {
  it('CompleteTaskRequest debug', () => {
    // const requestBase64 = 'CiC6kUe6UPrKaURS23xFjjOpoDIqy6rCS/Ndt7tRZd/zrBIg6YibHFTM1s8YSQHe2JIGmSHXb3dJtvc77Wzzub4aikQaQE9i53WmGskE1s/BhHMgN2G3fvYCVcdF6nElVgaVZZbwURymHRss0DnXifAamPHXRrttxY/rB/lFzEwFMFCrAQMiJXsicmVzdWx0IjoibGlvbiAtIDY1Ljg2JSIsInN0YXR1cyI6MX0qQFOD5/6c0ordhvqYy3kLNEZHd8IwnaUENUaRxfLtESqu4+gIAv2kHF4LAWgyiGjavLpzdrlViAKw/EXrw91m/AA='

    // const newRequestBuf = new proto.DelegateProtobuf('CompleteTaskRequest');
    // const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'));
    // console.log('decode:', newRequest);

    // console.log("refNum", Buffer.from(newRequest.refNum).toString('hex'))
    // console.log("teaId", Buffer.from(newRequest.teaId).toString('hex'))
    // console.log("delegateSig", Buffer.from(newRequest.delegateSig).toString('hex'))
    // console.log("result", Buffer.from(newRequest.result).toString('hex'))
    // console.log("resultSig", Buffer.from(newRequest.resultSig).toString('hex'))

    // assert.deepEqual(completeTaskRequest, newRequest);
  })

  it('DepositInfoResponse test', () => {
    // const responseBase64 = 'CjA1R3J3dmFFRjV6WGIyNkZ6OXJjUXBEV1M1N0N0RVJIcE5laFhDUGNOb0hHS3V0UVkSIEIfUPTJHmbQwsGMz9vvlIB0Gjx+sYn8RaLhiuPuGxhfGiCInBpXhZhg4Y0L1rZIjmAVcNznwG7uMMuYpjEC8JlypCJAgIZB3HbK4TU6pudOfJJ1Jmxsdz87fEJxpy9wlwrfMX3lTfEa3y0RA3WY9Eyif1tCdpkaTsWhTWtnFqrn5yimDCiOAjAy'
    const responseBase64 = 'CjA1R3J3dmFFRjV6WGIyNkZ6OXJjUXBEV1M1N0N0RVJIcE5laFhDUGNOb0hHS3V0UVkSIEIfUPTJHmbQwsGMz9vvlIB0Gjx+sYn8RaLhiuPuGxhfGiCInBpXhZhg4Y0L1rZIjmAVcNznwG7uMMuYpjEC8JlypCJAgIZB3HbK4TU6pudOfJJ1Jmxsdz87fEJxpy9wlwrfMX3lTfEa3y0RA3WY9Eyif1tCdpkaTsWhTWtnFqrn5yimDCiqATAy'

    const newResponseBuf = new proto.DelegateProtobuf('DepositInfoResponse')
    const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'))

    newResponse.delegatorEphemeralId = Buffer.from(newResponse.delegatorEphemeralId).toString('hex'),
    newResponse.delegatorTeaId = Buffer.from(newResponse.delegatorTeaId).toString('hex'),
    newResponse.delegatorSignature = Buffer.from(newResponse.delegatorSignature).toString('hex'),
    newResponse.amount = parseInt(newResponse.amount, 10)
    newResponse.expiredTime = parseInt(newResponse.expiredTime, 10)

    // console.log('decode:', newResponse);
  })
})
