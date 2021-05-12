const {RequestManager, HTTPTransport, WebSocketTransport, Client} = require("@open-rpc/client-js");
const {_} = require('tearust_utils');

const client = class {
  constructor(options) {
    this.opts = _.extend({
      http_url: '',
      ws_url: '',
    }, options || {});

    const http_transport = new HTTPTransport(this.opts.http_url);

    this.client = new Client(new RequestManager([http_transport]));
  }

  async call(rpc_name, params = []) {
    try {
      await this.client.request({
        method: rpc_name,
        params,
      });
    } catch (e) {
      console.log('call rpc ' + rpc_name + 'failed, details: ' + e)
    }
  }
};

module.exports = client;
