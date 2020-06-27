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
            delegateId: Buffer.from('01', 'hex'),
            modelCid: '444',
            payment: 1000,
            bodyCid: '555',
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
            const node = {
                  teaId: Buffer.from('01', 'hex'),
                  peers: [
                        Buffer.from('1229df2', 'hex'),
                        Buffer.from('5c83d8c', 'hex'),
                        Buffer.from('315d0ec', 'hex'),
                  ]
            }
            const addNewTaskResponse = {
                  accountId: Buffer.from('1234567', 'hex'),
                  delegateNode: node,
                  task,
            }

            const responseBuf = new proto.Protobuf('AddNewTaskResponse');
            responseBuf.payload(addNewTaskResponse);
            const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64');
            console.log("responseBase64", responseBase64);

            const newResponseBuf = new proto.Protobuf('AddNewTaskResponse');
            const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'));
            // console.log('decode:', newResponse);
            assert.deepEqual(addNewTaskResponse, newResponse);
      })

      it('CompleteTaskResponse test', () => {
            const completeTaskResponse = {
                  accountId: Buffer.from('111', 'hex'),
                  taskId: Buffer.from('222', 'hex'),
                  result: Buffer.from('333', 'hex'),
            }

            const responseBuf = new proto.Protobuf('CompleteTaskResponse');
            responseBuf.payload(completeTaskResponse);
            const responseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64');
            console.log("responseBase64", responseBase64);

            const newResponseBuf = new proto.Protobuf('CompleteTaskResponse');
            const newResponse = newResponseBuf.decode(Buffer.from(responseBase64, 'base64'));
            // console.log('decode:', newResponse);
            assert.deepEqual(completeTaskResponse, newResponse); 
      })
})