const {_} = require('tearust_utils');
const proto = require('../proto');
const b64 = require('js-base64');

exports.rpc_desc = {
  openrpc: '1.0.0',
  info: {
    title: "TEA-LAYER1-FACADE",
    version: "1.0.0",
  },
  methods: [
    {
      name: 'test',
      params: [
        {name: 'x', schema: { type: "integer" }},
        {name: 'y', schema: { type: "integer" }},
      ],
      result: {
        name: 'z', schema: { type: "integer" },
      }
    },
    {
      name: 'add_new_node',
      params: [
        {
          name: 'x',
          schema: {
            type: 'string'
          }
        }
      ],
      result: {
        name: 'rs', schema: { type: "string" },
      }
    },
  ],

};

exports.rpc_methods = (layer1, layer1_account)=>{
  return {
    add_new_node: async (param_b64)=>{

      const buf = Buffer.from(param_b64, 'base64');
      const newRequestBuf = new proto.DelegateProtobuf('AddNewNodeRequest');
      const newNodeRequest = newRequestBuf.decode(buf);

      const teaId = '0x' + newNodeRequest.teaId;

      const api = layer1.getApi();
      const tx = api.tx.tea.addNewNode(teaId);

      let rs = 'OK';
      try{
        await layer1.sendTx(layer1_account, tx);
      }catch(e){
        rs = e.toString();
      }
      

      return rs;
    },



    test: (a, b)=>{
      return a+b;
    }
  };
};