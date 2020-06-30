const types = {
      Weight: "u32",
      Address: "AccountId",
      TeaId: "Bytes",
      PeerId: "Bytes",
      RefNum: "Bytes",
      Result: "Bytes",
      Node: {
            "teaId": "TeaId",
            "peers": "Vec<PeerId>"
      },
      Model: {
            "account": "AccountId",
            "payment": "u32",
            "cid": "H256"
      },
      Task: {
            "refNum": "Bytes",
            "delegateNode": "TeaId",
            "modelCid": "Bytes",
            "bodyCid": "Bytes",
            "payment": "Balance"
      }
}

module.exports = types;