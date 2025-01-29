import { memoize } from '@exodus/basic-utils'

const resultFunction = (loading, rates, assets) =>
  memoize((assetName) => {
    if (loading) return false
    const isValid = (assetName) => {
      const asset = assets[assetName]
      if (!asset) return false
      const ticker = asset.ticker
      const rate = rates?.[ticker]
      if (!rate) return false
      return rates?.[ticker]?.invalid !== true
    }

    const asset = assets[assetName]
    if (!asset) return false

    if (asset.isCombined) {
      return asset.combinedAssetNames.some(isValid)
    }

    return isValid(assetName)
  })

const fiatRatesSelector = {
  id: 'getIsRateAvailable',
  resultFunction,
  dependencies: [
    //
    { selector: 'loading' },
    { selector: 'fiatRates' },
    { module: 'assets', selector: 'all' },
  ],
}

export default fiatRatesSelector
