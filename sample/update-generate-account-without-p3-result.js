const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToHex } = require('@polkadot/util')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types')
const rpc = require('../src/rpc')

// you need to 'npm install js-sha256'
var hash = require('js-sha256');
const request = require('request');

async function main () {
  const api = await ApiPromise.create({
    types,
    rpc
  })

  await cryptoWaitReady()

  const keyring = new Keyring({ type: 'sr25519' });
  const bob = keyring.addFromUri('//Bob', { name: 'Alice default' });
  const nonce = '200';
  const delegator_nonce_hash = Buffer.from(hash(nonce), 'hex');
  // todo use real rsa
  const delegator_nonce_rsa = Buffer.from('24d614bd215f1c90345a4b505be6bd0589ac6b105a2a8c059a5890ba953aec11', 'hex');
  const key_type = stringToU8a('bitcoin_mainnet');
  // todo use real p1
  const p1 = Buffer.from('24d614bd215f1c90345a4b505be6bd0589ac6b105a2a8c059a5890ba953aec11', 'hex');
  const p2_n = 3;
  const p2_k = 2;
  console.log("key_type:", key_type);
  console.log("p2_n:", p2_n);
  console.log("p2_k:", p2_k);
  console.log("delegator_nonce_hash:", delegator_nonce_hash);
  console.log("delegator_nonce_rsa:",delegator_nonce_rsa);
  console.log("p1:",p1);

  const task = {
    keyType: key_type,
    n: p2_n,
    k: p2_k,
    delegatorNonceHash: delegator_nonce_hash,
    delegatorNonceRsa: delegator_nonce_rsa,
    p1: p1
  }

  let options = {
    url: "http://localhost:9933",
    method: "post",
    headers:
        {
          "content-type": "application/json;charset=utf-8"
        },
    body: JSON.stringify( {
      "jsonrpc": "2.0",
      "id": "123",
      "method": "gluon_encodeAccountGenerationWithoutP3",
      "params": [Array.from(key_type),p2_n, p2_k, Array.from(delegator_nonce_hash),Array.from(delegator_nonce_rsa),Array.from(p1)]})
  };
  request(options, (error, response, body) => {
    if (error) {
      console.error('An error has occurred: ', error);
    } else {
      const encoded_data =  JSON.parse(body.toString()).result;
      // console.log('Post successful, encoded_data: ', encoded_data);
      const task_hash = hash(encoded_data);
      console.log('task_hash: ', task_hash);
      const task_hash_hex = u8aToHex(Buffer.from(task_hash, 'hex'));

      const task_id = '0xb5a2e1f3cabd598b8c2e5ecc0ee5f62b989c46a86f3e09b755843345d36ac760';
      const delegator_nonce = '200';
      const p2 = u8aToHex(stringToU8a('p2pubkey'));
      const p2_deployment_ids = ['0x1234', '0x5678'];
      const multi_sig_account = u8aToHex(stringToU8a('testAddress'));
      api.tx.gluon.updateGenerateAccountWithoutP3Result(task_hash_hex, delegator_nonce,
          p2, p2_deployment_ids, multi_sig_account)
          .signAndSend(bob, ({ events = [], status }) => {
            if (status.isInBlock) {
              console.log('Included at block hash', status.asInBlock.toHex())
              console.log('Events:')
              events.forEach(({ event: { data, method, section }, phase }) => {
                console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString())
              })
            } else if (status.isFinalized) {
              console.log('Finalized block hash', status.asFinalized.toHex())
            }
          })

    }
  });

  console.log('send nonce tx')
}

main()