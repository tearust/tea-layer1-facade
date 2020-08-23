const assert = require('assert');
const { ApiPromise } = require('@polkadot/api')
const NATS = require('nats')

const nc = NATS.connect();

function main() {
      // nc.subscribe('layer1.event.*.>', (msg, reply, subject, sid) => {
      //       console.log('Received a message: ', msg, reply, subject, sid)
      // })

      nc.subscribe('layer1.event.*.>', (msg, reply, subject, sid) => {
            console.log('Received a message: ', msg, reply, subject, sid)
      })
}

main()