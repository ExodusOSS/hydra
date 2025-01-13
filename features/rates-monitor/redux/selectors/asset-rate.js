import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
import { createSelector } from 'reselect'

const selectorFactory = (fiatRatesSelector, createAssetByNameSelector) =>
  memoize((assetName) =>
    createSelector(fiatRatesSelector, createAssetByNameSelector(assetName), (rates, asset) => {
      if (!asset) return null
      const ticker = asset.ticker
      return rates[ticker]
    })
  )

const createAssetRateSelector = {
  id: 'assetRate',
  selectorFactory,
  dependencies: [
    //
    { selector: 'fiatRates' },
    { selector: 'createAssetSelector', module: 'assets' },
  ],
}

export default createAssetRateSelector
