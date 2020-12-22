const types = {
  Address: 'AccountId',
  LookupSource: 'AccountId',
  TeaPubKey: '[u8; 32]',
  Url: 'Bytes',
  Cid: 'Bytes',
  TxData: "Bytes",
  RefNum: 'H256',
  Result: 'Bytes',
  NodeStatus: {
    _enum: ['Pending', 'Active', 'Inactive', 'Invalid']
  },
  RaResult: {
    teaId: 'TeaPubKey',
    targetTeaId: 'TeaPubKey',
    isPass: 'bool',
    targetStatus: 'NodeStatus'
  },
  ManifestInfo: {
    teaId: 'TeaPubKey',
    manifestCid: 'Cid'
  },
  Node: {
    teaId: 'TeaPubKey',
    ephemeralId: 'TeaPubKey',
    profileCid: 'Bytes',
    urls: 'Vec<Url>',
    peerId: 'Bytes',
    createTime: 'BlockNumber',
    updateTime: 'BlockNumber',
    raNodes: 'Vec<(TeaPubKey, bool)>',
    status: 'NodeStatus'
  },
  Model: {
    account: 'AccountId',
    payment: 'u32',
    cid: 'Bytes'
  },
  Task: {
    refNum: 'RefNum',
    delegatorTeaId: 'TeaPubKey',
    modelCid: 'Bytes',
    bodyCid: 'Bytes',
    payment: 'Balance'
  },
  Deposit: {
    delegatorTeaId: 'TeaPubKey',
    delegatorEphemeralId: 'TeaPubKey',
    delegatorSignature: 'Bytes',
    amount: 'Balance',
    expireTime: 'BlockNumber'
  },
  Bill: {
    employer: 'AccountId',
    delegatorTeaId: 'TeaPubKey',
    delegatorEphemeralId: 'TeaPubKey',
    errandUuid: 'Bytes',
    errandJsonCid: 'Bytes',
    executorEphemeralId: 'TeaPubKey',
    expiredTime: 'BlockNumber',
    resultCid: 'Cid',
    bills: 'Vec<(AccountId, Balance)>'
  },
  Data: {
    delegatorEphemeralId: 'TeaPubKey',
    deploymentId: 'Cid',
    cid: 'Cid',
    description: 'Cid',
    capChecker: 'Cid'
  },
  Service: {
    delegatorEphemeralId: 'TeaPubKey',
    deploymentId: 'Cid',
    cid: 'Cid',
    capChecker: 'Cid'
  },
  RuntimeActivity: {
    teaId: 'TeaPubKey',
    cid: 'Cid',
    ephemeralId: 'TeaPubKey',
    updateHeight: 'BlockNumber'
  },
  KeyGenerationData: {
    keyType: "Cid",
    n: "u32",
    k: "u32",
    delegatorTeaId: "TeaPubKey"
  },
  KeyGenerationResult: {
    taskId: "Cid",
    publicKey: "Cid",
    deploymentIds: "Vec<Cid>"
  },
  SignTransactionData: {
    keyTaskId: "Cid",
    dataAdhoc: "TxData",
    delegatorTeaId: "TeaPubKey"
  },
  SignTransactionResult: {
    taskId: "Cid",
    signedTx: "TxData"
  }
}

module.exports = types
