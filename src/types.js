const types = {
  Address: 'AccountId',
  LookupSource: 'AccountId',
  TeaPubKey: '[u8; 32]',
  Url: 'Bytes',
  Cid: 'Bytes',
  TxData: "Bytes",
  RefNum: 'H256',
  Result: 'Bytes',
  ClientPubKey: "Bytes",
  Signature: "Bytes",
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
  AccountAsset: {
    accountId: "Cid",
    btc: "Vec<Cid>",
    eth: "Vec<Cid>"
 },
  Asset: {
    owner: "AccountId",
    p2: "Cid",
    deploymentIds: "Vec<Cid>"
  },
  AccountGenerationDataWithoutP3: {
    keyType: "Cid",
    n: "u32",
    k: "u32",
    delegatorNonceHash: "Cid",
    delegatorNonceRsa: "Cid",
    p1: "Cid"
  },
  KeyGenerationResult: {
    taskId: "Cid",
    delegatorNonce: "Cid",
    p2: "Cid",
    p2DeploymentIds: "Vec<Cid>",
    multiSigAccount: "Cid"
  },
  SignTransactionData: {
    dataAdhoc: "TxData",
    delegatorNonceHash: "Cid",
    delegatorNonceRsa: "Cid"
  },
  SignTransactionResult: {
    taskId: "Cid",
    succeed: 'bool'
  },
  TransferAssetTask: {
    from: "Cid",
    to: "Cid",
    startHeight: "BlockNumber"
  },
  //////////////
  // multiSig //
  //////////////
  Timepoint: {
    /// The height of the chain at the point in time.
    height: 'BlockNumber',
    /// The index of the extrinsic at the point in time.
    index: 'u32'
  },
  Multisig: {
    /// The extrinsic when the multisig operation was opened.
    when: 'Timepoint',
    /// The amount held in reserve of the `depositor`, to be returned once the operation ends.
    deposit: 'Balance',
    /// The account who opened it (i.e. the first to approve it).
    depositor: 'AccountId',
    /// The approvals achieved so far, including the depositor. Always sorted.
    approvals: 'Vec<AccountId>'
  },
  OpaqueCall: 'Vec<u8>',
  Weight: 'u64'
}

module.exports = types
