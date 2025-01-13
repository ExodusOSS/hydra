import loading from './loading'
import fiatRatesSelector from './fiat-rates'
import getIsRateAvailable from './get-is-rate-available'
import pricesByAssetNameSelector from './prices-by-asset-name'
import createAssetPriceSelector from './asset-price'
import createAssetRateSelector from './asset-rate'

export default [
  loading,
  fiatRatesSelector,
  getIsRateAvailable,
  pricesByAssetNameSelector,
  createAssetPriceSelector,
  createAssetRateSelector,
]
