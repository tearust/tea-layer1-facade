const { ApiPromise, Keyring } = require('@polkadot/api')
const { stringToU8a, u8aToHex } = require('@polkadot/util')
const types = require('../src/types')
const rpc = require('../src/rpc')
const toHex = require('to-hex')

async function main () {
  const api = await ApiPromise.create({
    types,
    rpc
  })

  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri('//Alice', { name: 'Alice default' });

  const keyring2 = new Keyring({ type: 'ed25519' });
  const bob = keyring2.addFromUri('//Bob', { name: 'Bob default' });

  const teaIdStr = 'df38cb4f12479041c8e8d238109ef2a150b017f382206e24fee932e637c2db7b';
  const teaId = u8aToHex(Buffer.from(teaIdStr, 'hex'))
  const cid =  u8aToHex(Buffer.from('d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d', 'hex'));
  const ephemeralId =  u8aToHex(bob.publicKey);
  // const signature =  u8aToHex(bob.sign(stringToU8a(teaIdStr)));
  const signature =  u8aToHex(Buffer.from('6cdfd962de21784d91686afdb18f9afc141eb24f80e2e284d16d1512cd8f49e995def792d6c91ec13bdcfaf3bd6616717672a7fb8d993b1aab62371278012e00', 'hex'));
  const delegatorPubkey =  u8aToHex(Buffer.from('421f50f4c91e66d0c2c18ccfdbef9480741a3c7eb189fc45a2e18ae3ee1b185f', 'hex'));
  // const isValid = bob.verify(teaIdStr, signature);
  // console.log("isValid:", isValid)

  console.log("teaId:", teaId);
  console.log("cid:", cid);
  console.log("ephemeralId:", ephemeralId);
  console.log("signature:", signature, "len:", signature.length);
  console.log("delegatorPubkey:", delegatorPubkey);

  await api.tx.tea.updateRuntimeActivity(teaId, cid, ephemeralId, signature, delegatorPubkey)
      .signAndSend(alice, ({ events = [], status }) => {
        if (status.isInBlock) {
          console.log('Included at block hash', status.asInBlock.toHex());
          console.log('Events:');
          events.forEach(({ event: { data, method, section }, phase }) => {
            console.log('\t', phase.toString(), `: ${section}.${method}`, data.toString());
          })
        } else if (status.isFinalized) {
          console.log('Finalized block hash', status.asFinalized.toHex());
        }
      });
  console.log('send updateRuntimeActivity tx');
}

main()
