const resultFunction = (walletAccounts, getAssetBalances) =>
  walletAccounts.reduce((all, walletAccount) => {
    for (const [assetName, balance] of Object.entries(getAssetBalances(walletAccount))) {
      if (!all[assetName]) {
        all[assetName] = balance
        continue
      }

      all[assetName] = all[assetName].add(balance)
    }

    return all
  }, {})

const byAssetSelector = {
  id: 'byAsset',
  resultFunction,
  dependencies: [
    //
    { module: 'walletAccounts', selector: 'enabled' },
    { selector: 'getAccountAssetsBalanceSelector' },
  ],
}

export default byAssetSelector
