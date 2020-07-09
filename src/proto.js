const protobuf = require('protobufjs');
const protobufJSON = require('./protobuf/protobuf.json');

const root = protobuf.Root.fromJSON(protobufJSON);

class Protobuf {
  constructor(key, obj){
    this.key = key;
    this.obj = root.lookup(`${obj}.${key}`);
    this._payload = null;
  }
  payload(payload){
    let err = this.obj.verify(payload);
    if(err){
      console.error(err);
      throw 'invalid payload for '+this.key;
    }
    this._payload = payload;
  }
  toBuffer(){
    const msg = this.obj.create(this._payload);
    return this.obj.encode(msg).finish();
  }
  decode(buf){
    return this.obj.decode(buf);
  }
}

class DelegateProtobuf extends Protobuf {
  constructor(key) {
    super(key, 'actor_delegate');
  }
}

class RAProtobuf extends Protobuf {
  constructor(key) {
    super(key, 'actor_ra');
  }
}

const F = {
  DelegateProtobuf,
  RAProtobuf,
  stringToU8(str){
    var arr = [];
    for (var i = 0, j = str.length; i < j; ++i) {
      arr.push(str.charCodeAt(i));
    }
  
    var tmpUint8Array = new Uint8Array(arr);
    return tmpUint8Array;
  },
  u8ToString(u8_arr){
    var dataString = "";
    for (var i = 0; i < u8_arr.length; i++) {
      dataString += String.fromCharCode(u8_arr[i]);
    }
  
    return dataString;
  }
};

// test
// const aa = new F.Protobuf('TaskRegisterRequest');
// aa.payload({
//   cidHash: [{
//     cid: 'dfdfd',
//     hash: F.stringToU8('sfefesf')
//   }],
//   ekey1: F.stringToU8('eeeeee'),
//   blockChainAccount: F.stringToU8('sdfsdfs')
// });

// const buf = aa.toBuffer();
// console.log(11, buf);

// const dd = aa.decode(buf);
// console.log(22, dd);

module.exports = F;