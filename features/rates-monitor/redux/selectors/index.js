import loading from './loading.js'
import fiatRatesSelector from './fiat-rates.js'
import getIsRateAvailable from './get-is-rate-available.js'
import pricesByAssetNameSelector from './prices-by-asset-name.js'
import createAssetPriceSelector from './asset-price.js'
import createAssetRateSelector from './asset-rate.js'

export default [
  loading,
  fiatRatesSelector,
  getIsRateAvailable,
  pricesByAssetNameSelector,
  createAssetPriceSelector,
  createAssetRateSelector,
]
