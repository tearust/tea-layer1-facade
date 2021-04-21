const { Server, ServerOptions } = require("@open-rpc/server-js");
const { HTTPServerTransportOptions } = require("@open-rpc/server-js/build/transports/http");
const { WebSocketServerTransportOptions } = require("@open-rpc/server-js/build/transports/websocket");
const { OpenrpcDocument } = require("@open-rpc/meta-schema");
const { parseOpenRPCDocument } = require("@open-rpc/schema-utils-js");
const { MethodMapping } = require("@open-rpc/server-js/build/router");
const cors = require('cors');

const {_} = require('tearust_utils');
const {rpc_desc, rpc_methods} = require('./methods');

const methodMapping = {
  addition: (a, b) => a + b,
  subtraction: (a, b) => a - b,
};

const server = class {
  constructor(layer1_instance, layer1_account){
    this.layer1 = layer1_instance;
    this.layer1_account = layer1_account;

    this.serverOptions = null;
    this.server = null;
  }

  async init(){
    this.serverOptions = {
      // openrpcDocument: await parseOpenRPCDocument(rpc_desc),
      openrpcDocument: rpc_desc,
      transportConfigs: [
        {
          type: "HTTPTransport",
          options: {
            port: 3330,
            middleware: [
              cors({ origin: "*" })
            ],
          },
        },
        {
          type: "WebSocketTransport",
          options: {
            port: 3331,
            middleware: [],
          },
        },
      ],
      methodMapping: rpc_methods(this.layer1, this.layer1_account),
    };
  
    const http_port = _.get(this.serverOptions, 'transportConfigs.0.options.port');
    const ws_port = _.get(this.serverOptions, 'transportConfigs.1.options.port');
    this.server = new Server(this.serverOptions);

    await this.server.start();

    console.log(`RPC server start with ${http_port}[HTTP] & ${ws_port}[WS]`);
  }

};

module.exports = server;