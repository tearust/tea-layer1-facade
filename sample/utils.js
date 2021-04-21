
const {_} = require('tearust_utils/index.cjs');
// const {Layer1} = require('tearust_layer1');

const client = require('../src/jsonrpc/client');


exports._ = _;

const sleep = exports.sleep = (time)=>{
  return new Promise((resolve) => setTimeout(resolve, time))
}

exports.runSample = async (name, fn, type="layer1")=>{
  name = name || _.last(process.argv[1].split('/'));
  console.log('----- sample ['+name+'] start -----');

  if(type === 'layer1'){
    // const layer1 = new Layer1();
    // await layer1.init();

    // try{
    //   await fn(layer1, (param, cb)=>{
    //     layer1._transactionCallback(param, (err, data)=>{
    //       if(err){
    //         console.error(`TX ERROR => ${err}`);
    //         cb(err);
    //       }
    //       else{
    //         cb(null, data);
    //       }
    
    //     });
    
    //   });
    // }catch(e){
    //   console.error(e);
    // }
  }
  else if(type === 'rpc'){
    try{
      const c = new client({
        http_url: 'http://localhost:3330',
      });
      await fn(c);
    }catch(e){
      console.error('[RPC]', e);
    }
  }

  
  console.log('----- sample ['+name+'] end -----');
  process.exit(0);
}

