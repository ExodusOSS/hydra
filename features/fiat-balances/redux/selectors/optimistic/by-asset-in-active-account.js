const resultFunction = (optimisticByAssetSource, activeWalletAccount) =>
  optimisticByAssetSource?.[activeWalletAccount]

const optimisticByAssetInActiveAccountSelector = {
  id: 'optimisticByAssetInActiveAccount',
  resultFunction,
  dependencies: [
    //
    { selector: 'optimisticByAssetSource' },
    { module: 'walletAccounts', selector: 'active' },
  ],
}

export default optimisticByAssetInActiveAccountSelector
