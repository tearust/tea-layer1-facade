## tea-layer1-facade

#### Start

Run nats service
```
docker pull nats
docker run -p 4222:4222 -ti nats:latest
```

Run layer1

Run layer1 facade
```
npm install
npm start
```

#### Nats Api
> Use nats-box an example of nats.rs for testing

- Get node info
```bash
cargo run --example nats-box -- pub layer1.async.layer1_reply.node_info eb628d56ad353cc7a9b4db31aae999c402a02da9da6d2651a8e9aa2f73920b95
```

Response:
```
Received a Message {
  subject: "layer1_reply.action.node_info",
  data: "{"key":"0xeb628d56ad353cc7a9b4db31aae999c402a02da9da6d2651a8e9aa2f73920b95","amt":321}"
}
```

- Get bootstrap
```bash
cargo run --example nats-box -- pub layer1.async.layer1_reply.bootstrap 123
```

Response:
```
Received a Message {
  subject: "layer1_reply.action.bootstrap",
  data: "["tea-node1","tea-node2"]"
}
```

- Get block hash
```bash
cargo run --example nats-box -- pub layer1.async.layer1_reply.get_block_hash 10
```

Response:
```
Received a Message {
  subject: "layer1_reply.action.get_block_hash",
  data: "\"0x7a3cb3d654df28ccc328c2760a6dd7036a13b232f5639d5c1626795a03c44b88\""
}
```

- Add new node
```
nc.publish('layer1.async.replay.add_new_node', '0x02b40e313842e45574e0ca5b37cb0580cc3378ceb096b562a9828b2137b98f5f', 'layer1.test.result')
```

Response:
```
Received a Message {
  subject: "layer1.test.result",
  data: "{"status":{"InBlock":"0x2d00885753cfe9988e21dbfe86cfe7d1a7fb4f52df937cb7682a46f88bc6e10b"},"tea_id":"0x02b40e313842e45574e0ca5b37cb0580cc3378ceb096b562a9828b2137b98f5f"}"
}
```

- Update peer ID
```
nc.publish('layer1.async.replay.update_peer_id', '0x02b40e313842e45574e0ca5b37cb0580cc3378ceb096b562a9828b2137b98f5f__0x1fbb8d02600f4931fbed2e4f998d9e16d1a95e6d4586b5787310a95d2f8a6ed4_0xa555a7e72e9810dde46ca653d56956a2d6e88bb3896038f19674bd3b02d94d18', 'layer1.test.result')
```

Response:
```
Received a Message {
  subject: "layer1.test.result",
  data: "{"status":{"InBlock":"0x269d352a5c5cd1776ebd72750e44e08b1caad309862fd571b4ac87575ae0f10c"},"tea_id":"0x02b40e313842e45574e0ca5b37cb0580cc3378ceb096b562a9828b2137b98f5f"}"
}
```

- Get node list
```
nc.publish('layer1.async.replay.get_nodes', '', 'layer1.test.result')
```

Response:
```
Received a Message {
  subject: "layer1.test.result",
  data: "[{"TeaId":"0x02b40e313842e45574e0ca5b37cb0580cc3378ceb096b562a9828b2137b98f5f","Peers":["0x1fbb8d02600f4931fbed2e4f998d9e16d1a95e6d4586b5787310a95d2f8a6ed4","0xa555a7e72e9810dde46ca653d56956a2d6e88bb3896038f19674bd3b02d94d18"]},{"TeaId":"0xdd487dbc71b5fd6260a523b0b9b9f8258763f58848c96f888dbddc07d3d094db","Peers":["0xdd487dbc71b5fd6260a523b0b9b9f8258763f58848c96f888dbddc07d3d094db","0x316ca2db416e37a37d2d2aa57a07aaffb1ac65ad4bf8fa4367c1e1edce9f60d6"]},{"TeaId":"0xa2d56e0a85f22450963acb427530073b497fb73d3ff48eb3ab534fb483b7e412","Peers":["0x13363206e8593bb175c94ee0a978ece66ecf911396bffc4a1dffc0c589a51e13","0x02b40e313842e45574e0ca5b37cb0580cc3378ceb096b562a9828b2137b98f5f","0x4b60d01ac2e35e9067358342b228d96e2fb0e8ad801d99de34cdbaaa53cd7965"]}]"
}
```

- Add new task

Message format: {tea_id}_{ref_num}_{cap_cid}_{model_cid}_{data_cid}_{payment}

Note: `tea_id` must already exsit in the layer1.

```
nc.publish('layer1.async.replay.add_new_task', '0x04_110_0x01_0x02_0x03_10', 'layer1.test.result')
```

### Listener

- Listen new block
```bash
cargo run --example nats-box -- sub 'layer1.chain.newheader.>'
```

Response:
```
Received a Message {
  subject: "layer1.chain.newheader.11504",
  data: "0x23491f576dd33543a4bc7fa2b99f922a44fc26e086adcfd0acda1b54df0028ee"
}
```

- Listen new event

Subject format: layer1.event.{layer1_module}.{event}

```bash
cargo run --example nats-box -- sub 'layer1.event.tea.NewTaskAdded'
```

Response:
```
{"section":"tea","method":"NewTaskAdded","data":{"AccountId":"5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY","Node":{"TeaId":"0x04","Peers":["0x02","0x03"]},"Task":{"delegate_node":"0x04","ref_num":112,"cap_cid":"0x05","model_cid":"0x06","data_cid":"0x07","payment":50}}}
```