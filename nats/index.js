const NATS = require('nats')
const layer1 = require('../layer1')

const nc = NATS.connect()

function handle_chain(header) {
      nc.publish('layer1.chain.newheader', `${header.number}.${header.hash}`)
}

exports.start = function () {
      layer1.chain_listener(handle_chain).catch((error) => {
            console.error(error)
            process.exit(-1)
      })

      // Simple Subscriber
      // nc.subscribe('layer1.chain.newheader', function (msg) {
      //       console.log('Received a message: ' + msg)
      // })
}
