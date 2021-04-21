const {_} = require('tearust_utils');
const proto = require('../proto');

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
    },
  ],

};

exports.rpc_methods = (layer1, layer1_account)=>{
  return {
    add_new_node: async (param_b64)=>{
      const newRequestBuf = new proto.DelegateProtobuf('AddNewNodeRequest');
      const newNodeRequest = newRequestBuf.decode(Buffer.from(param_b64, 'base64'));

      const teaId = '0x' + newNodeRequest.teaId;
      // const nonce = await layer1.getLayer1Nonce(layer1_account.address);

      const api = layer1.getApi();
      const tx = api.tx.tea.addNewNode(teaId);
      await layer1.sendTx(layer1_account, tx);

        // await api.tx.tea.addNewNode(teaId)
        //   .signAndSend(ac, {nonce: nonce}, ({ events = [], status }) => {
        //     if (status.isInBlock) {
        //       console.log('Add new node with teaId ' + teaId)
        //       nc.publish(reply, JSON.stringify({ status, teaId }))
        //     } else {
        //       console.log('Status of transfer: ' + status.type)
        //     }

        //     events.forEach(({ phase, event: { data, method, section } }) => {
        //       console.log(phase.toString() + ' : ' + section + '.' + method + ' ' + data.toString())
        //     })
        //   })
        // console.log('send add_new_node tx')
    },



    test: (a, b)=>{
      return a+b;
    }
  };
};