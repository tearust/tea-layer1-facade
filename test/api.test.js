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
      it('AddNewTaskRequest test', () => {
            const task = {
                  teaId: Buffer.from('01', 'hex'),
                  refNum: Buffer.from('abcdefg', 'hex'),
                  rsaPub: Buffer.from('c7e016fad0796bb68594e49a6ef1942cf7e73497e69edb32d19ba2fab3696596', 'hex'),
                  capCid: '111',
                  manifestCid: '222',
                  wasmCid: '333',
                  modelCid: '444',
                  dataCid: '555',
                  payment: 1000,
            }

            const taskBuf = new proto.Protobuf('AddNewTaskRequest');
            taskBuf.payload({task});
            const taskBufBase64 = Buffer.from(taskBuf.toBuffer()).toString('base64');

            const newTaskBuf = new proto.Protobuf('AddNewTaskRequest');
            const newTask = newTaskBuf.decode(Buffer.from(taskBufBase64, 'base64'));
            // console.log('decode:', newTask);
            assert.deepEqual({task}, newTask);
      });

      it('AddNewTaskResponse test', () => {
            const task = {
                  teaId: Buffer.from('01', 'hex'),
                  refNum: Buffer.from('abcdefg', 'hex'),
                  rsaPub: Buffer.from('c7e016fad0796bb68594e49a6ef1942cf7e73497e69edb32d19ba2fab3696596', 'hex'),
                  capCid: '111',
                  manifestCid: '222',
                  wasmCid: '333',
                  modelCid: '444',
                  dataCid: '555',
                  payment: 1000,
            }
            const node = {
                  teaId: Buffer.from('01', 'hex'),
                  peers: [
                        Buffer.from('1229df2', 'hex'),
                        Buffer.from('5c83d8c', 'hex'),
                        Buffer.from('315d0ec', 'hex'),
                  ]
            }
            const response = {
                  accountId: Buffer.from('1234567', 'hex'),
                  delegateNode: node,
                  task,
            }

            const responseBuf = new proto.Protobuf('AddNewTaskResponse');
            responseBuf.payload(response);
            const newTaskResponseBase64 = Buffer.from(responseBuf.toBuffer()).toString('base64');
            console.log("newTaskResponseBase64", newTaskResponseBase64);

            const newResponseBuf = new proto.Protobuf('AddNewTaskResponse');
            const newResponse = newResponseBuf.decode(Buffer.from(newTaskResponseBase64, 'base64'));
            // console.log('decode:', newResponse);
            assert.deepEqual(response, newResponse);
      })
})