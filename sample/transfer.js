const toHex = require('to-hex');	
const { ApiPromise, Keyring } = require('@polkadot/api')	
const { cryptoWaitReady } = require('@polkadot/util-crypto')	
const types = require('../src/types');	
const rpc = require('../src/rpc');	

async function main() {	
      const api = await ApiPromise.create({	
            types,	
            rpc	
      })	

      await cryptoWaitReady()	

      const keyring = new Keyring({ type: 'sr25519' });	
      const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });	

      // const ALICE = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';
      const BOB = '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty';

      // Get a random number between 1 and 100000
      // const randomAmount = Math.floor((Math.random() * 100) + 1);

      const randomAmount = 1000;

      const transfer = api.tx.balances.transfer(BOB, randomAmount);

      // Sign and Send the transaction
      transfer.signAndSend(alice, ({ events = [], status }) => {
            if (status.isInBlock) {
                  console.log('Successful transfer of ' + randomAmount + ' with hash ' + status.asInBlock.toHex());
            } else {
                  console.log('Status of transfer: ' + status.type);
            }

            events.forEach(({ phase, event: { data, method, section } }) => {
                  console.log(phase.toString() + ' : ' + section + '.' + method + ' ' + data.toString());
            });
      });
}	

main() 