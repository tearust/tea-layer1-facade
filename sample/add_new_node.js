const {runSample} = require('./utils');
const proto = require('../src/proto');

const b64 = require('js-base64');

const {stringToU8a} = require('tearust_layer1');

runSample(null, async (rpc)=>{
  const p = new proto.DelegateProtobuf('AddNewNodeRequest');
  p.payload({
    teaId: stringToU8a('aaaaa')
  });

  const buf = p.toBuffer();

  const param_b64 = b64.encode(buf);

  const rs = await rpc.call('add_new_node', [param_b64]);
  console.log(rs);

}, 'rpc');