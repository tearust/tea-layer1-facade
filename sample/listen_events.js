const toHex = require('to-hex');
const { ApiPromise, Keyring } = require('@polkadot/api');
const { cryptoWaitReady } = require('@polkadot/util-crypto');
const types = require('../src/types');

async function main() {
      const api = await ApiPromise.create({
            types: types
      })

      await cryptoWaitReady()

      // Subscribe to system events via storage
      api.query.system.events((events) => {
            handle_events(events)
      });
}

function handle_events(events) {
      // Loop through the Vec<EventRecord>
      events.forEach((record) => {
            // Extract the phase, event and the event types
            const { event, phase } = record;
            const types = event.typeDef;
        
            if (event.section == 'tea') {
                  console.log(`Received tea events:`);

                  let eventData = {}
                  // Loop through each of the parameters, displaying the type and data
                  event.data.forEach((data, index) => {
                        // console.log(`\t\t\t${types[index].type}: ${data.toString()}`);
                        eventData[types[index].type] = data
                  });
                  console.log('eventData:', JSON.stringify(eventData));

                  switch (event.method) {
                        case 'CompleteTask':

                              console.log('CompleteTask:', JSON.stringify(eventData.RefNum));
                              
                              break
                        default:
                  }
            }
      });
}


main()