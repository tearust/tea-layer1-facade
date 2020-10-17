## tea-layer1-facade

### Account

#### Install subkey
```
curl https://getsubstrate.io -sSf | bash -s -- --fast
cargo install --force subkey --git https://github.com/paritytech/substrate --version 2.0.0
```

#### Generate new account
```
subkey generate
```
Return
```
Secret phrase `ball era toward play company unknown veteran universe tower pencil old upset` is account:
  Secret seed:      0xf3266e943a8b3ed58e171c3491143e65322d0fe8d0b9d27bcb53763bddd6e6fd
  Public key (hex): 0x7e848c52314be77a339ec83697f5707f17632b1b6092230b383807d9fe486c27
  Account ID:       0x7e848c52314be77a339ec83697f5707f17632b1b6092230b383807d9fe486c27
  SS58 Address:     5EvbGMuZqE5eMkr8dFDpAQ6UCpFeGberTxWXYHHRiRmHJAp5
```

### ENV configuration

#### NATS_URL
`NATS_URL` specity Nats Server URL:Port. If not specified, default value will be `127.0.0.1:4222`

#### FACADE_WSURL
`FACADE_WSURL` specify a websocket url which layer1 server you wanted. `ws://127.0.0.1:9944` is used by default if not specified.

 e.g: `FACADE_WSURL=wss://poc-3.polkadot.io`

#### FACADE_ACCOUNT_URI
`FACADE_ACCOUNT_URI` specify a substrate account suri. It can be a mnemonic, a hex seed or string seeds.

e.g: 

Use the Alice dev account: `FACADE_ACCOUNT_URI=//Alice`.

Use a mnemonic: `FACADE_ACCOUNT_URI=ball era toward play company unknown veteran universe tower pencil old upset`.

Use a hex seed: `FACADE_ACCOUNT_URI=0xf3266e943a8b3ed58e171c3491143e65322d0fe8d0b9d27bcb53763bddd6e6fd`.

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
- Nats body: base64 of encoded ephemeral_public_key
- Reply_to subject: As request msg's reply_to field
- Reply body: base64 of encoded actor-ra.proto NodeProfile

#### Look up tea node profile
- Nats subject: layer1.async.reply.lookup_node_profile
- Nats body: base64 of encoded ephemeral_public_key
- Reply_to subject: As request msg's reply_to field
- Reply body: base64 of encoded actor-ra.proto NodeProfile

#### Update tea node profile
- Nats subject: layer1.async.reply.update_node_profile
- Nats body: base64 encoded protobuf encoded [u8]. The message is actor-ra.proto TeaNodeUpdateProfileRequest
- Reply_to subject: As request msg's reply_to field
- Reply body: base64 of encoded actor-ra.proto TeaNodeResponse

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

#### Update runtime activity
- Nats subject: layer1.async.reply.update_runtime_activity
- Nats body: base64 of encoded actor-delegate.proto UpdateRuntimeActivity 

- Reply_to subject: As request msg's reply_to field
- Reply body: base64 of encoded actor-delegate.proto RuntimeActivityResponse

#### Get runtime activity by tea id
- Nats subject: layer1.async.reply.runtime_activity_by_tea_id
- Nats body: base64 of encoded tea id

- Reply_to subject: As request msg's reply_to field
- Reply body: base64 of encoded actor-delegate.proto RuntimeActivityResponse


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