const {_} = require("tearust_utils");
const proto = require("../proto");
const b64 = require("js-base64");
const {JSONRPCError} = require("@open-rpc/server-js");

exports.rpc_desc = {
  openrpc: "1.0.0",
  info: {
    title: "TEA-LAYER1-FACADE",
    version: "1.0.0",
  },
  methods: [
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
    {
      name: "updateNodeProfile",
      params: [
        {
          schema: {
            name: "updateNodeProfileRequest",
            type: "object",
            properties: {
              ephemeralPublicKey: {
                type: "string",
              },
              profileCid: {
                type: "string",
              },
              teaId: {
                type: "string",
              },
              peerId: {
                type: "string",
              },
              publicUrls: {
                type: "array",
                items: {
                  type: "string",
                }
              }
            }
          }
        }
      ],
    }
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

    updateNodeProfile: async (params) => {
      const ephemeralPublicKey = "0x" + Buffer.from(params.ephemeralPublicKey, "base64").toString("hex");
      const teaId = "0x" + Buffer.from(params.teaId, "base64").toString("hex");
      const profileCid = "0x" + Buffer.from(params.profileCid).toString("hex");
      const peerId = "0x" + Buffer.from(params.peerId).toString("hex");
      const publicUrls = []
      params.publicUrls.forEach((url, i) => {
        publicUrls.push("0x" + Buffer.from(url).toString("hex"));
      })

      const api = layer1.getApi();
      const tx = api.tx.tea.updateNodeProfile(teaId, ephemeralPublicKey, profileCid, publicUrls, peerId);

      try {
        await layer1.sendTx(layer1_account, tx);
      } catch (e) {
        throw new JSONRPCError("Layer1 Error", -32603, e);
      }
    }
  };
};
