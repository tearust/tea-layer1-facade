const assert = require('assert');
const proto = require('../src/proto');
const _ = require('lodash');

async function foo() {
    return  1+1
}

describe('layer1::api', function() {
      it('test add new node', async () => {
            assert.equal(2, await foo());
      });
});

describe('delegate protobuf test suit', () => {
      const task = {
            refNum: Buffer.from('01', 'hex'),
            delegateId: Buffer.from('02', 'hex'),
            modelCid: '444',
            bodyCid: '555',
            payment: 1000,
      }

      it('AddNewTaskRequest test', () => {
            const taskBuf = new proto.DelegateProtobuf('AddNewTaskRequest');
            taskBuf.payload({task});
            const taskBufBase64 = Buffer.from(taskBuf.toBuffer()).toString('base64');

            const newTaskBuf = new proto.DelegateProtobuf('AddNewTaskRequest');
            const newTask = newTaskBuf.decode(Buffer.from(taskBufBase64, 'base64'));
            // console.log('decode:', newTask);
            assert.deepEqual({task}, newTask);
      });

      it('AddNewTaskResponse test', () => {
            const addNewTaskResponse = {
                  accountId: Buffer.from('1234567', 'hex'),
                  task,
            }

            const responseBuf = new proto.DelegateProtobuf('AddNewTaskResponse');
            responseBuf.payload(addNewTaskResponse);
            const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64');
            console.log("AddNewTaskResponse Base64", responseBase64);

            const newResponseBuf = new proto.DelegateProtobuf('AddNewTaskResponse');
            const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'));
            // console.log('decode:', newResponse);
            assert.deepEqual(addNewTaskResponse, newResponse);
      })

      it('CompleteTaskRequest test', () => {
            const completeTaskRequest = {
                  refNum: Buffer.from('111', 'hex'),
                  teaId: Buffer.from('01', 'hex'),
                  delegateSig: Buffer.from('222', 'hex'),
                  result: Buffer.from('333', 'hex'),
                  resultSig: Buffer.from('444', 'hex'),
            }

            const requestBuf = new proto.DelegateProtobuf('CompleteTaskRequest');
            requestBuf.payload(completeTaskRequest);
            const requestBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64');
            console.log("CompleteTaskRequest Base64", requestBase64);

            const newRequestBuf = new proto.DelegateProtobuf('CompleteTaskRequest');
            const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'));
            // console.log('decode:', newRequest);
            assert.deepEqual(completeTaskRequest, newRequest); 
      })

      it('CompleteTaskResponse test', () => {
            const completeTaskResponse = {
                  refNum: Buffer.from('222', 'hex'),
                  accountId: Buffer.from('111', 'hex'),
                  result: Buffer.from('333', 'hex'),
            }

            const responseBuf = new proto.DelegateProtobuf('CompleteTaskResponse');
            responseBuf.payload(completeTaskResponse);
            const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64');
            console.log("CompleteTaskResponse Base64", responseBase64);

            const newResponseBuf = new proto.DelegateProtobuf('CompleteTaskResponse');
            const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'));
            // console.log('decode:', newResponse);
            assert.deepEqual(completeTaskResponse, newResponse); 
      })

      const data = {
            delegatorEphemeralId: Buffer.from('01', 'hex'),
            deploymentId: '777',
            dataCid: '888',
            descriptionCid: '999',
            capCid: '000'
      }

      it('AddNewDataRequest test', () => {
            const dataBuf = new proto.DelegateProtobuf('AddNewDataRequest');
            dataBuf.payload({data});
            const dataBufBase64 = Buffer.from(dataBuf.toBuffer()).toString('base64');

            const newDataBuf = new proto.DelegateProtobuf('AddNewDataRequest');
            const newData = newDataBuf.decode(Buffer.from(dataBufBase64, 'base64'));
            // console.log('decode:', newData);
            assert.deepEqual({data}, newData);
      });

      it('AddNewDataResponse test', () => {
            const addNewDataResponse = {
                  accountId: Buffer.from('1234567', 'hex'),
                  data,
            }

            const responseBuf = new proto.DelegateProtobuf('AddNewDataResponse');
            responseBuf.payload(addNewDataResponse);
            const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64');
            console.log("AddNewDataResponse Base64", responseBase64);

            const newResponseBuf = new proto.DelegateProtobuf('AddNewDataResponse');
            const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'));
            // console.log('decode:', newResponse);
            assert.deepEqual(addNewDataResponse, newResponse);
      })

      it('DepositResponse test', () => {
            const deposit = {
                  delegatorEphemeralId: Buffer.from('01', 'hex'),
                  depositPubKey: Buffer.from('02', 'hex'),
                  delegatorSignature: Buffer.from('03', 'hex'),
                  amount: 1000,
                  expiredTime: 10000,
            }
            const depositResponse = {
                  accountId: Buffer.from('1234567', 'hex'),
                  deposit,
            }

            const responseBuf = new proto.DelegateProtobuf('DepositResponse');
            responseBuf.payload(depositResponse);
            const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64');
            console.log("DepositResponse Base64", responseBase64);

            const newResponseBuf = new proto.DelegateProtobuf('DepositResponse');
            const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'));
            // console.log('decode:', newResponse);
            newResponse.deposit.amount = parseInt(newResponse.deposit.amount, 10);
            newResponse.deposit.expiredTime = parseInt(newResponse.deposit.expiredTime, 10);

            assert.deepEqual(depositResponse, newResponse);
      })

      it('SettleAccountsRequest test', () => {
            const settleAccountsRequest = {
                  employer: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
                  delegatorEphemeralId: Buffer.from('02', 'hex'),
                  errandUuid: '03',
                  payment: 100,
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

            const newRequestBuf = new proto.DelegateProtobuf('SettleAccountsRequest');
            const newRequest = newRequestBuf.decode(Buffer.from(requestBufBase64, 'base64'));
            newRequest.expiredTime = parseInt(newRequest.expiredTime, 10)
            // console.log('decode:', newRequest);
            // newRequest.payment
            assert.deepEqual(settleAccountsRequest, newRequest);
      });

      it('SettleAccountsResponse test', () => {
            const settleAccountsResponse = {
                  accountId: Buffer.from('1234567', 'hex'),
                  employer: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
                  delegatorEphemeralId: Buffer.from('02', 'hex'),
                  errandUuid: '03',
                  payment: 100,
                  paymentType: 1,
                  executorEphemeralId: Buffer.from('05', 'hex'),
                  expiredTime: 6,
                  resultCid: '08',
            }

            const responseBuf = new proto.DelegateProtobuf('SettleAccountsResponse');
            responseBuf.payload(settleAccountsResponse);
            const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64');
            console.log("SettleAccountsResponse Base64", responseBase64);

            const newResponseBuf = new proto.DelegateProtobuf('SettleAccountsResponse');
            const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'));
            newResponse.expiredTime = parseInt(newResponse.expiredTime, 10)

            // console.log('decode:', newResponse);
            assert.deepEqual(settleAccountsResponse, newResponse);
      })
})

describe('ra protobuf test suit', () => {
      let nodeProfile = {
            ephemeralPublicKey: Buffer.from('111', 'hex'),
            profileCid: '222',
            teaId: Buffer.from('333', 'hex'),
            publicUrls: ['1','2'],
            peerId: 'QmZzcViy4RvG7m1yVqjfGQ8HPmrM3Kk2MhodTRue2ZTGfh',
      }

      it('TeaNodeUpdateProfileRequest test', () => {
            const updateProfileRequest = {
                  nodeProfile,
                  signature: Buffer.from('777', 'hex'),
            }

            const buf = new proto.RAProtobuf('TeaNodeUpdateProfileRequest');
            buf.payload(updateProfileRequest);
            const requestBase64 = Buffer.from(buf.toBuffer()).toString('base64');
            console.log("TeaNodeUpdateProfileRequest Base64", requestBase64);

            const newRequestBuf = new proto.RAProtobuf('TeaNodeUpdateProfileRequest');
            const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'));
            // console.log('decode:', newRequest);
            assert.deepEqual(updateProfileRequest, newRequest); 
      })

      it('TeaNodeResponse test', () => {
            const buf = new proto.RAProtobuf('TeaNodeResponse');
            buf.payload({nodeProfile});
            const base64 = Buffer.from(buf.toBuffer()).toString('base64');
            console.log("TeaNodeResponse Base64", base64);

            const newResponseBuf = new proto.RAProtobuf('TeaNodeResponse');
            const newResponse = newResponseBuf.decode(Buffer.from(base64, 'base64'));
            // console.log('decode:', newResponse);
            assert.deepEqual({nodeProfile}, newResponse); 
      })
})

describe('debug', function() {
      it('CompleteTaskRequest debug', () => {
            const requestBase64 = 'CiC6kUe6UPrKaURS23xFjjOpoDIqy6rCS/Ndt7tRZd/zrBIg6YibHFTM1s8YSQHe2JIGmSHXb3dJtvc77Wzzub4aikQaQE9i53WmGskE1s/BhHMgN2G3fvYCVcdF6nElVgaVZZbwURymHRss0DnXifAamPHXRrttxY/rB/lFzEwFMFCrAQMiJXsicmVzdWx0IjoibGlvbiAtIDY1Ljg2JSIsInN0YXR1cyI6MX0qQFOD5/6c0ordhvqYy3kLNEZHd8IwnaUENUaRxfLtESqu4+gIAv2kHF4LAWgyiGjavLpzdrlViAKw/EXrw91m/AA='

            const newRequestBuf = new proto.DelegateProtobuf('CompleteTaskRequest');
            const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'));
            // console.log('decode:', newRequest);

            // console.log("refNum", Buffer.from(newRequest.refNum).toString('hex'))
            // console.log("teaId", Buffer.from(newRequest.teaId).toString('hex'))
            // console.log("delegateSig", Buffer.from(newRequest.delegateSig).toString('hex'))
            // console.log("result", Buffer.from(newRequest.result).toString('hex'))
            // console.log("resultSig", Buffer.from(newRequest.resultSig).toString('hex'))

            // assert.deepEqual(completeTaskRequest, newRequest); 
      })
});