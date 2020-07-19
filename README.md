## tea-layer1-facade

### Start

Run nats service
```
docker pull nats
docker run -p 4222:4222 -ti nats:latest
```

Run layer1 node

Run layer1 facade
```
npm install
npm start
```

### ENV
- `FACADE_WSURL` specify a websocket url which layer1 server you wanted. `ws://127.0.0.1:9944` is used by default if not specified.
 e.g: `FACADE_WSURL=wss://poc-3.polkadot.io`

- `FACADE_ACCOUNT` specify a account of layer1. `Alice` is used by default if not specified.
e.g: `FACADE_ACCOUNT=Bob`

### Nats Api

#### Get block hash
```bash
cargo run --example nats-box -- pub layer1.async.layer1_reply.get_block_hash 10
```

Reply Message:
```
Received a Message {
  subject: "layer1_reply.action.get_block_hash",
  data: "\"0x7a3cb3d654df28ccc328c2760a6dd7036a13b232f5639d5c1626795a03c44b88\""
}
```

#### Update tea node profile
Nats subject: layer1.async.replay.update_node_profile
Nats body: base64 encoded protobuf encoded [u8]. The message is actor-ra.proto TeaNodeUpdateProfileRequest
Sample data structure: (need to base64 encoded, protobuf encode before sending)
Sample data structure:
```
//TeaNodeUpdateProfileRequest
{ 
  ephemeral_public_key: [233, 136, 155, 28, 84, 204, 214, 207, 24, 73, 1, 222, 216, 146, 6, 153, 33, 215, 111, 119, 73, 182, 247, 59, 237, 108, 243, 185, 190, 26, 138, 68],//this is the Ed25519 pub key
  public_urls: ["placeholder_url1", "placeholder_url2"], //the list of public URL that this delegate allow web client to access to
  profile_cid: "QmfL6ry4YRKD4joa3RMQZ1qYGKGBWJqHYtEiJEjBmQrASB" //the IPFS Cid of the profile data
}
```
Reply_to subject:       actor.ra.inbox.tea_node_update_profile_response
Body: Error message string
```
let nodeProfile = {
      ephemeralPublicKey: Buffer.from('111', 'hex'),
      profileCid: '222',
      teaId: Buffer.from('c7e016fad0796bb68594e49a6ef1942cf7e73497e69edb32d19ba2fab3696596', 'hex'),
      publicUrls: ['1','2'],
}

const updateProfileRequest = {
      nodeProfile,
      signature: Buffer.from('112233', 'hex'),
}

const buf = new proto.RAProtobuf('TeaNodeUpdateProfileRequest');
buf.payload(updateProfileRequest);
const requestBase64 = Buffer.from(buf.toBuffer()).toString('base64');

nc.publish('layer1.async.reply.update_node_profile', requestBase64, 'layer1.test.result')
```
#### Look up tea node profile
Nats subject: layer1.async.replay.lookup_node_profile
Nats body: base64 ephemeral_public_key
Reply_to subject: As request msg's reply_to field
Reply body: base64 of encoded actor-ra.proto NodeProfile


#### Add new task

Note: `tea_id`(delegateId ) must already exsit in the layer1.

```
const task = {
      refNum: Buffer.from('01', 'hex'),
      delegateId: Buffer.from('01', 'hex'),
      modelCid: '444',
      bodyCid: '555',
      payment: 1000,
}
const taskBuf = new proto.Protobuf('AddNewTaskRequest');
taskBuf.payload({ task });

const taskBufBase64 = Buffer.from(taskBuf.toBuffer()).toString('base64');
nc.publish('layer1.async.reply.add_new_task', taskBufBase64, 'layer1.test.result')
```

#### Complete task

Note: `ref_num` must already exsit in the layer1.

```
const completeTaskRequest = {
      refNum: Buffer.from('0c6123c17c95bd6617a01ef899f5895ddb190eb3265f341687f4c0ad1b1f366f', 'hex'),
      teaId: Buffer.from('e9889b1c54ccd6cf184901ded892069921d76f7749b6f73bed6cf3b9be1a8a44', 'hex'),
      delegateSig: Buffer.from('577ca5104490756b320da325aa81e272049fcee7bb63fe1f92220201a15c47025e3032b85366fcf85b3a2f24418a933b9d6c4fcd94e145b783e2364980a93c0d', 'hex'),
      result: Buffer.from('0xe9889b1c54ccd6cf184901ded892069921d76f7749b6f73bed6cf3b9be1a8a440c6123c17c95bd6617a01ef899f5895ddb190eb3265f341687f4c0ad1b1f366f', 'hex'),
      resultSig: Buffer.from('44', 'hex'),
}

const requestBuf = new proto.Protobuf('CompleteTaskRequest');
requestBuf.payload(completeTaskRequest);
const requestBase64 = Buffer.from(requestBuf.toBuffer()).toString('base64');
nc.publish('layer1.async.reply.complete_task', requestBase64, 'layer1.test.result')
```

### Listener

#### Listen new block
```bash
cargo run --example nats-box -- sub 'layer1.chain.newheader.>'
```

Reply Message:
```
Received a Message {
  subject: "layer1.chain.newheader.11504",
  data: "0x23491f576dd33543a4bc7fa2b99f922a44fc26e086adcfd0acda1b54df0028ee"
}
```

#### Listen new event

```bash
cargo run --example nats-box -- sub 'layer1.event.tea.NewTaskAdded'
```

Subject format: layer1.event.{layer1_module}.{event}

if event is NewTaskAdded, the msg body is base64 of actor-delegate.proto message Task.

Message format: https://github.com/tearust/tea-codec/blob/master/proto/actor-delegate.proto#L63

Sample:
```
const task = {
      delegateId: Buffer.from('01', 'hex'),
      modelCid: '444',
      payment: 1000,
      bodyCid: '555',
}
const node = {
      teaId: Buffer.from('01', 'hex'),
      peers: [
            Buffer.from('1229df2', 'hex'),
            Buffer.from('5c83d8c', 'hex'),
            Buffer.from('315d0ec', 'hex'),
      ]
}
const response = {
      accountId: Buffer.from('1234567', 'hex'),
      delegateNode: node,
      task,
}
```

Message Body:
```
CgMSNFYSEgoBARIDEinfEgNcg9gSAzFdDhoQCgEBEgM0NDQY6AciAzU1NQ==
//this is the base64 of a protobuf Task message
```
