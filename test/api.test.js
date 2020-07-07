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

describe('protobuf test suit', () => {

      const task = {
            refNum: Buffer.from('01', 'hex'),
            delegateId: Buffer.from('02', 'hex'),
            modelCid: '444',
            bodyCid: '555',
            payment: 1000,
      }

      it('AddNewTaskRequest test', () => {
            const taskBuf = new proto.Protobuf('AddNewTaskRequest');
            taskBuf.payload({task});
            const taskBufBase64 = Buffer.from(taskBuf.toBuffer()).toString('base64');

            const newTaskBuf = new proto.Protobuf('AddNewTaskRequest');
            const newTask = newTaskBuf.decode(Buffer.from(taskBufBase64, 'base64'));
            // console.log('decode:', newTask);
            assert.deepEqual({task}, newTask);
      });

      it('AddNewTaskResponse test', () => {
            // const node = {
            //       teaId: Buffer.from('01', 'hex'),
            //       peers: [
            //             Buffer.from('1229df2', 'hex'),
            //             Buffer.from('5c83d8c', 'hex'),
            //             Buffer.from('315d0ec', 'hex'),
            //       ]
            // }
            const addNewTaskResponse = {
                  accountId: Buffer.from('1234567', 'hex'),
                  task,
                  // delegateNode: node,
            }

            const responseBuf = new proto.Protobuf('AddNewTaskResponse');
            responseBuf.payload(addNewTaskResponse);
            const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64');
            console.log("AddNewTaskResponse Base64", responseBase64);

            const newResponseBuf = new proto.Protobuf('AddNewTaskResponse');
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

            const requestBuf = new proto.Protobuf('CompleteTaskRequest');
            requestBuf.payload(completeTaskRequest);
            const requestBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64');
            console.log("CompleteTaskRequest Base64", requestBase64);

            const newRequestBuf = new proto.Protobuf('CompleteTaskRequest');
            const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'));
            // console.log('decode:', newRequest);
            assert.deepEqual(completeTaskRequest, newRequest); 
      })

      // CiC6kUe6UPrKaURS23xFjjOpoDIqy6rCS/Ndt7tRZd/zrBIg6YibHFTM1s8YSQHe2JIGmSHXb3dJtvc77Wzzub4aikQaQE9i53WmGskE1s/BhHMgN2G3fvYCVcdF6nElVgaVZZbwURymHRss0DnXifAamPHXRrttxY/rB/lFzEwFMFCrAQMiJXsicmVzdWx0IjoibGlvbiAtIDY1Ljg2JSIsInN0YXR1cyI6MX0qQFOD5/6c0ordhvqYy3kLNEZHd8IwnaUENUaRxfLtESqu4+gIAv2kHF4LAWgyiGjavLpzdrlViAKw/EXrw91m/AA=
      it('CompleteTaskResponse test', () => {
            const completeTaskResponse = {
                  refNum: Buffer.from('222', 'hex'),
                  accountId: Buffer.from('111', 'hex'),
                  result: Buffer.from('333', 'hex'),
            }

            const responseBuf = new proto.Protobuf('CompleteTaskResponse');
            responseBuf.payload(completeTaskResponse);
            const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64');
            console.log("CompleteTaskResponse Base64", responseBase64);

            const newResponseBuf = new proto.Protobuf('CompleteTaskResponse');
            const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'));
            // console.log('decode:', newResponse);
            assert.deepEqual(completeTaskResponse, newResponse); 
      })
})

describe('debug', function() {
      it('CompleteTaskRequest debug', () => {
            const requestBase64 = 'CiC6kUe6UPrKaURS23xFjjOpoDIqy6rCS/Ndt7tRZd/zrBIg6YibHFTM1s8YSQHe2JIGmSHXb3dJtvc77Wzzub4aikQaQE9i53WmGskE1s/BhHMgN2G3fvYCVcdF6nElVgaVZZbwURymHRss0DnXifAamPHXRrttxY/rB/lFzEwFMFCrAQMiJXsicmVzdWx0IjoibGlvbiAtIDY1Ljg2JSIsInN0YXR1cyI6MX0qQFOD5/6c0ordhvqYy3kLNEZHd8IwnaUENUaRxfLtESqu4+gIAv2kHF4LAWgyiGjavLpzdrlViAKw/EXrw91m/AA='

            const newRequestBuf = new proto.Protobuf('CompleteTaskRequest');
            const newRequest = newRequestBuf.decode(Buffer.from(requestBase64, 'base64'));
            console.log('decode:', newRequest);

            console.log("refNum", Buffer.from(newRequest.refNum).toString('hex'))
            console.log("teaId", Buffer.from(newRequest.teaId).toString('hex'))
            console.log("delegateSig", Buffer.from(newRequest.delegateSig).toString('hex'))
            console.log("result", Buffer.from(newRequest.result).toString('hex'))
            console.log("resultSig", Buffer.from(newRequest.resultSig).toString('hex'))

            // assert.deepEqual(completeTaskRequest, newRequest); 
      })
});