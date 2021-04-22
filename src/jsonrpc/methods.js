const {_} = require("tearust_utils");
const proto = require("../proto");
const b64 = require("js-base64");
const { JSONRPCError } = require("@open-rpc/server-js");

exports.rpc_desc = {
  openrpc: "1.0.0",
  info: {
    title: "TEA-LAYER1-FACADE",
    version: "1.0.0",
  },
  methods: [
    {
      name: "test",
      params: [
        {name: "x", schema: {type: "integer"}},
        {name: "y", schema: {type: "integer"}},
      ],
      result: {
        name: "z", schema: {type: "integer"},
      }
    },
    {
      name: "addNewNode",
      params: [
        {
          schema: {
            name: "addNewNodeRequest",
            type: "object",
            properties: {
              teaId: {
                type: "string",
              }
            }
          }
        }
      ],
      result: {
        name: "addNewNodeResponse", schema: {
          type: "object",
          properties: {
            teaId: {
              type: "string",
            }
          }
        },
      }
    },
  ],

};

exports.rpc_methods = (layer1, layer1_account) => {
  return {
    addNewNode: async (params) => {
      const teaId = "0x" + Buffer.from(params.teaId, "base64").toString("hex");

      const api = layer1.getApi();
      const tx = api.tx.tea.addNewNode(teaId);

      let rs = {
        teaId: params.teaId,
      };
      try {
        await layer1.sendTx(layer1_account, tx);
      } catch (e) {
        throw new JSONRPCError("Layer1 Error", -32603, e);
      }

      return rs;
    },


    test: (a, b) => {
      return a + b;
    }
  };
};
