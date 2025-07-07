import type { assetPriceDefinition } from './asset-price.js'
import type { assetRateDefinition } from './asset-rate.js'
import type { fiatRatesDefinition } from './fiat-rates.js'
import type { getIsRateAvailableDefinition } from './get-is-rate-available.js'
import type { loadingDefinition } from './loading.js'
import type { pricesByAssetNameDefinition } from './prices-by-asset-name.js'

declare const selectorDefinitions: [
  typeof assetPriceDefinition,
  typeof assetRateDefinition,
  typeof fiatRatesDefinition,
  typeof getIsRateAvailableDefinition,
  typeof loadingDefinition,
  typeof pricesByAssetNameDefinition,
]

export default selectorDefinitions
