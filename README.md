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

- Listen new block
```bash
cargo run --example nats-box -- sub 'layer1.chain.newheader'
```

Response:
```
Received a Message {
  subject: "layer1.chain.newheader",
  data: "11504.0x23491f576dd33543a4bc7fa2b99f922a44fc26e086adcfd0acda1b54df0028ee"
}
```