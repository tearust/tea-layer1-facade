
const { ApiPromise, Keyring } = require('@polkadot/api')
const { cryptoWaitReady } = require('@polkadot/util-crypto')

async function main() {
      const api = await ApiPromise.create({
            types: {
                  Weight: "u32",
                  Address: "AccountId",
                  TeaId: "Bytes",
                  PeerId: "Bytes",
                  TaskIndex: "u32",
                  Node: {
                        "TeaId": "TeaId",
                        "Peers": "Vec<PeerId>"
                  },
                  Model: {
                        "account": "AccountId",
                        "payment": "u32",
                        "cid": "H256"
                  },
                  Task: {
                        "delegate_node": "TeaId",
                        "ref_num": "u32",
                        "cap_cid": "Bytes",
                        "model_cid": "Bytes",
                        "data_cid": "Bytes",
                        "payment": "u32"
                  }
            }
      })

      await cryptoWaitReady()

      const keyring = new Keyring({ type: 'sr25519' });
      const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });

      var teaId = '0x04'
      let refNum = 112
      let capCid = '0x05'
      let modelCid = '0x06'
      let dataCid = '0x07'
      let payment = 50

      await api.tx.tea.addNewTask(teaId, refNum, capCid, modelCid, dataCid, payment)
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