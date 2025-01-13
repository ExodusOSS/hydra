const resultFunction = (optimisticByBaseAssetSource, activeWalletAccount) =>
  optimisticByBaseAssetSource?.[activeWalletAccount]

const optimisticByBaseAssetInActiveAccountSelector = {
  id: 'optimisticByBaseAssetInActiveAccount',
  resultFunction,
  dependencies: [
    //
    { selector: 'optimisticByBaseAssetSource' },
    { module: 'walletAccounts', selector: 'active' },
  ],
}

export default optimisticByBaseAssetInActiveAccountSelector
