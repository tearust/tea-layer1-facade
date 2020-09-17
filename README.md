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
- `NATS_URL` specity Nats Server URL:Port. If not specified, default value will be `127.0.0.1:4222`

- `FACADE_WSURL` specify a websocket url which layer1 server you wanted. `ws://127.0.0.1:9944` is used by default if not specified.

 e.g: `FACADE_WSURL=wss://poc-3.polkadot.io`

- `FACADE_ACCOUNT` specify a account of layer1. `Alice` is used by default if not specified.

e.g: `FACADE_ACCOUNT=Bob`

Currently available values are：Alice, Bob, Charlie, Eve, Ferdie.

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

#### Get node profile by tea id
- Nats subject: layer1.async.reply.node_profile_by_tea_id
- Nats body: ephemeral_public_key hex string
- Reply_to subject: As request msg's reply_to field
- Reply body: base64 of encoded actor-ra.proto NodeProfile

```
nc.publish('layer1.async.reply.node_profile_by_tea_id', '0xc7e016fad0796bb68594e49a6ef1942cf7e73497e69edb32d19ba2fab3696596', 'layer1.test.result')
```

Reply Message:
```
CiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABIAGiDJOA/eG6eV/GVqsIq070SCz1VHkP06vNRkJBiuj7X9UioA
```

#### Update tea node profile
- Nats subject: layer1.async.reply.update_node_profile
- Nats body: base64 encoded protobuf encoded [u8]. The message is actor-ra.proto TeaNodeUpdateProfileRequest
- Sample data structure: (need to base64 encoded, protobuf encode before sending)
- Sample data structure:
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
- Nats subject: layer1.async.reply.lookup_node_profile
- Nats body: base64 ephemeral_public_key
- Reply_to subject: As request msg's reply_to field
- Reply body: base64 of encoded actor-ra.proto NodeProfile

#### Get deposit info
- Nats subject: layer1.async.reply.deposit_info
- Nats body: base64 of encoded actor-delegate.proto DepositInfoRequest or empty [] if cannot find deposit

- Reply_to subject: As request msg's reply_to field
- Reply body: base64 of encoded actor-delegate.proto DepositInfoResponse or empty [] if cannot find deposit

#### Add new data
```
const data = {
      delegatorEphemeralId: Buffer.from('01', 'hex'),
      deploymentId: '777',
      dataCid: '888',
      descriptionCid: '999',
      capCid: '000'
}
const dataBuf = new proto.DelegateProtobuf('AddNewDataRequest');
dataBuf.payload({ data });

const dataBufBase64 = Buffer.from(dataBuf.toBuffer()).toString('base64');

nc.publish('layer1.async.reply.add_new_data', dataBufBase64, 'layer1.test.result')
```

#### Add new node
- Nats subject: layer1.async.reply.add_new_node
- Nats body: base64 of encoded actor-delegate.proto AddNewNodeRequest 

- Reply_to subject: As request msg's reply_to field
- Reply body: base64 of encoded actor-delegate.proto AddNewNodeResponse

#### Commit remote attestation result
- Nats subject: layer1.async.reply.commit_ra_result
- Nats body: base64 of encoded actor-ra.proto CommitRaResultRequest

- Reply_to subject: As request msg's reply_to field
- Reply body: base64 of encoded actor-ra.proto CommitRaResultResponse

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

Subject format: layer1.event.{layer1_module}.{event}

- NewTaskAdded

sub 'layer1.event.tea.NewTaskAdded'

The msg body is base64 of encoded actor-delegate.proto AddNewTask message.

Message Body:
```
CgMSNFYSEgoBARIDEinfEgNcg9gSAzFdDhoQCgEBEgM0NDQY6AciAzU1NQ==
```

- NewDepositAdded

sub 'layer1.event.tea.NewDepositAdded'

The msg body is base64 of encoded actor-delegate.proto DepositInfoResponse message.

Message Body:
```
CiDUNZPHFf3THGEUGr0EqZ/WgiyFWIVMzeOaVoTnpW2ifRIgQh9Q9MkeZtDCwYzP2++UgHQaPH6xifxFouGK4+4bGF8aIIicGleFmGDhjQvWtkiOYBVw3OfAbu4wy5imMQLwmXKkIkCAhkHcdsrhNTqm5058knUmbGx3Pzt8QnGnL3CXCt8xfeVN8RrfLREDdZj0TKJ/W0J2mRpOxaFNa2cWqufnKKYMKICAqOwFMDI=
```

- SettleAccounts

sub 'layer1.event.tea.SettleAccounts'

The msg body is base64 of encoded actor-delegate.proto SettleAccountsResponse message.

Message Body:
```
CjA1R3J3dmFFRjV6WGIyNkZ6OXJjUXBEV1M1N0N0RVJIcE5laFhDUGNOb0hHS3V0UVkSIEIfUPTJHmbQwsGMz9vvlIB0Gjx+sYn8RaLhiuPuGxhfGiCInBpXhZhg4Y0L1rZIjmAVcNznwG7uMMuYpjEC8JlypCJAgIZB3HbK4TU6pudOfJJ1Jmxsdz87fEJxpy9wlwrfMX3lTfEa3y0RA3WY9Eyif1tCdpkaTsWhTWtnFqrn5yimDCgAMDI=
```

- CommitRaResult

sub 'layer1.event.tea.CommitRaResult'

The msg body is base64 of encoded actor-delegate.proto CommitRaResultResponse message.

Message Body:
```
CiDUNZPHFf3THGEUGr0EqZ/WgiyFWIVMzeOaVoTnpW2ifRIgQh9Q9MkeZtDCwYzP2++UgHQaPH6xifxFouGK4+4bGF8aIIicGleFmGDhjQvWtkiOYBVw3OfAbu4wy5imMQLwmXKkIkCAhkHcdsrhNTqm5058knUmbGx3Pzt8QnGnL3CXCt8xfeVN8RrfLREDdZj0TKJ/W0J2mRpOxaFNa2cWqufnKKYMKICAqOwFMDI=
```