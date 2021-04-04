

const GLUON_ERRORS = `
  InvalidSig,
  InvalidNonceSig,
  InvalidSignatureLength,
  DelegatorNotExist,
  AccountIdConvertionError,
  InvalidToAccount,
  SenderIsNotBuildInAccount,
  SenderAlreadySigned,
  TransferAssetTaskTimeout,
  BrowserTaskALreadyExist,
  BrowserNonceAlreadyExist,
  AppBrowserPairAlreadyExist,
  NonceNotMatch,
  NonceNotExist,
  TaskNotMatch,
  TaskNotExist,
  KeyGenerationSenderAlreadyExist,
  KeyGenerationSenderNotExist,
  KeyGenerationTaskAlreadyExist,
  KeyGenerationResultExist,
  SignTransactionTaskAlreadyExist,
  SignTransactionResultExist,
  AccountGenerationTaskAlreadyExist,
  AssetAlreadyExist,
  AssetNotExist,
  InvalidAssetOwner,
  AppBrowserNotPair,
  AppBrowserPairNotExist,
  TaskTimeout,
  PairNotExist,
  InvalidKeyTypeForAccountAsset,
`;

const format = (errors)=>{
  return errors.split(',').map((v) => {
    return v.trim();
  });
};

const RECOVERY_ERRORS = `
  NotAllowed,
  ZeroThreshold,
  NotEnoughFriends,
MaxFriends,
NotSorted,
NotRecoverable,
AlreadyRecoverable,
AlreadyStarted,
NotStarted,
NotFriend,
DelayPeriod,
AlreadyVouched,
Threshold,
StillActive,
Overflow,
AlreadyProxy,
`;

// index list was defined in tea-layer1/runtime/src/lib.rs
module.exports = {
  10: format(GLUON_ERRORS),
  12: format(RECOVERY_ERRORS),
};
