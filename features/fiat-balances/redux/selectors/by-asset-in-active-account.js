const resultFunction = (byAssetSource, activeWalletAccount) => byAssetSource?.[activeWalletAccount]

const byAssetInActiveAccountSelector = {
  id: 'byAssetInActiveAccount',
  resultFunction,
  dependencies: [
    //
    { selector: 'byAssetSource' },
    { module: 'walletAccounts', selector: 'active' },
  ],
}

export default byAssetInActiveAccountSelector
