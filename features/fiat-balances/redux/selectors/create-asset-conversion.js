import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'
import { conversionByRate } from '@exodus/currency'

const selectorFactory = (fiatCurrencySelector, assetsSelector, createAssetRateSelector) =>
  memoize((assetName) =>
    createSelector(
      fiatCurrencySelector,
      (state) => assetsSelector(state)[assetName],
      createAssetRateSelector(assetName),
      (fiatCurrency, asset, rate) => {
        let fiatRate
        if (fiatCurrency.defaultUnit.unitName === 'USD') {
          fiatRate = rate?.priceUSD || 0
        } else {
          fiatRate = rate?.price || 0
        }

        return conversionByRate(asset.currency, fiatCurrency, fiatRate)
      }
    )
  )

const createConversionSelectorDefinition = {
  id: 'createAssetConversion',
  selectorFactory,
  dependencies: [
    //
    { selector: 'currencyUnitType', module: 'locale' },
    { selector: 'all', module: 'assets' },
    { selector: 'assetRate', module: 'rates' },
  ],
}

export default createConversionSelectorDefinition
