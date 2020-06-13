const assert = require('assert');
const { ApiPromise } = require('@polkadot/api')
const NATS = require('nats')

const nc = NATS.connect();

function add_new_node() {
      nc.publish('layer1.async.replay.add_new_node', '0x02b40e313842e45574e0ca5b37cb0580cc3378ceb096b562a9828b2137b98f5f', 'layer1.test.result')
}

function update_peer_id() {
      nc.publish('layer1.async.replay.update_peer_id', '0x02b40e313842e45574e0ca5b37cb0580cc3378ceb096b562a9828b2137b98f5f__0x1fbb8d02600f4931fbed2e4f998d9e16d1a95e6d4586b5787310a95d2f8a6ed4_0xa555a7e72e9810dde46ca653d56956a2d6e88bb3896038f19674bd3b02d94d18', 'layer1.test.result')
}

function get_nodes() {
      nc.publish('layer1.async.replay.get_nodes', '', 'layer1.test.result')
}

function add_new_task() {
      nc.publish('layer1.async.replay.add_new_task', '0x04_110_0x01_0x02_0x03_10', 'layer1.test.result')
}

function main() {
      // add_new_node()
      // update_peer_id()
      // get_nodes()
      add_new_task()
}

main()