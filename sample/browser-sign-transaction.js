const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const { stringToU8a, u8aToHex } = require('@polkadot/util')
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
  const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });

  // prepare data
  const data_adhoc = u8aToHex(stringToU8a('transactionData'))
  const nonce = '200';
  const delegator_nonce_hash = u8aToHex(Buffer.from(hash(nonce), 'hex'));
  // todo use real rsa
  const delegator_nonce_rsa = u8aToHex(Buffer.from('24d614bd215f1c90345a4b505be6bd0589ac6b105a2a8c059a5890ba953aec11', 'hex'));
  console.log("data_adhoc:", data_adhoc);
  console.log("delegator_nonce_hash:", delegator_nonce_hash);
  console.log("delegator_nonce_rsa:",delegator_nonce_rsa);

  // send transaction
  api.tx.gluon.browserSignTx(data_adhoc, delegator_nonce_hash, delegator_nonce_rsa)
      .signAndSend(alice, ({ events = [], status }) => {
        if (status.isInBlock) {
          console.log('Included at block hash', status.asInBlock.toHex());
          console.log('Events:');
          events.forEach(({ event: { data, method, section }, phase }) => {
            console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
            if (section === 'gluon' && method === 'BrowserSignTransactionRequested') {
              console.log('\t','sign transaction task found, browser:', u8aToHex(data[0]), "task_id:", u8aToHex(data[1]))
            }
          })
        } else if (status.isFinalized) {
          console.log('Finalized block hash', status.asFinalized.toHex());
        }
      })

  console.log('send browserSignTx tx')
}

main()
