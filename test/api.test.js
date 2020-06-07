const assert = require('assert');
const { ApiPromise } = require('@polkadot/api')

async function foo() {
    return  1+1
}

describe('layer1::api', function() {
      it('test add new node', async () => {
            assert.equal(2, await foo());
      });

//     it('should return 15 when string is AeIoU',function(){
//         assert.equal(15,15);
//     });
});