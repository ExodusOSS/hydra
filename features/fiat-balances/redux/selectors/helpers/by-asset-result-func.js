const resultFunction = (byAssetSource) =>
  Object.values(byAssetSource).reduce((all, assetBalances) => {
    for (const [assetName, balance] of Object.entries(assetBalances)) {
      if (!all[assetName]) {
        all[assetName] = balance
        continue
      }

      all[assetName] = all[assetName].add(balance)
    }

    return all
  }, {})

export default resultFunction
