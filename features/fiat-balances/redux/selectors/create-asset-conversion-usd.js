import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'
import { conversionByRate } from '@exodus/currency'
import currencies from '@exodus/fiat-currencies'

const fiatCurrency = currencies.USD

const selectorFactory = (assetsSelector, createAssetRateSelector) =>
  memoize((assetName) =>
    createSelector(
      (state) => assetsSelector(state)[assetName],
      createAssetRateSelector(assetName),
      (asset, rate) => {
        const fiatRate = rate?.priceUSD || 0
        return conversionByRate(asset.currency, fiatCurrency, fiatRate)
      }
    )
  )

const createConversionSelectorDefinition = {
  id: 'createAssetConversionUsd',
  selectorFactory,
  dependencies: [
    //
    { selector: 'all', module: 'assets' },
    { selector: 'assetRate', module: 'rates' },
  ],
}

export default createConversionSelectorDefinition
