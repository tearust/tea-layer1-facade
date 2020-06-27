const toHex = require('to-hex');
const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')
const types = require('../src/types');

async function main() {
      const api = await ApiPromise.create({
            types: types
      })

      await cryptoWaitReady()

      const keyring = new Keyring({ type: 'sr25519' });
      const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });

      // The following fields need not put into layer1 any more.
      // Use a cid on IPFS named bodyCid instead of the following fields. 
      // let rsaPub = '0x03';
      // let capCid = toHex(Buffer.from('111'), { addPrefix: true });
      // let manifestCid = toHex(Buffer.from('222'), { addPrefix: true });
      // let wasmCid = toHex(Buffer.from('333'), { addPrefix: true });
      
      const refNum = '0x02';
      const teaId = '0x01';
      const modelCid = toHex(Buffer.from('444'), { addPrefix: true });
      const bodyCid = toHex(Buffer.from('555'), { addPrefix: true });
      const payment = 50;

      await api.tx.tea.addNewTask(refNum, teaId, modelCid, bodyCid, payment)
            .signAndSend(alice, ({ events = [], status }) => {
                  if (status.isInBlock) {
                        console.log('Included at block hash', status.asInBlock.toHex());
                        console.log('Events:');
                        events.forEach(({ event: { data, method, section }, phase }) => {
                              console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
                        });
                  } else if (status.isFinalized) {
                        console.log('Finalized block hash', status.asFinalized.toHex());
                  }
      });

      console.log('send add_new_task tx')
}

main()