import createAssetRateSelector from './asset-rate.js'
import createAssetPriceSelector from './asset-price.js'
import fiatRatesSelector from './fiat-rates.js'
import getIsRateAvailable from './get-is-rate-available.js'
import loading from './loading.js'
import pricesByAssetNameSelector from './prices-by-asset-name.js'

const selectorDefinitions = [
  loading,
  fiatRatesSelector,
  getIsRateAvailable,
  pricesByAssetNameSelector,
  createAssetPriceSelector,
  createAssetRateSelector,
] as const

export default selectorDefinitions
