import type { assetPriceDefinition } from './asset-price'
import type { assetRateDefinition } from './asset-rate'
import type { fiatRatesDefinition } from './fiat-rates'
import type { getIsRateAvailableDefinition } from './get-is-rate-available'
import type { loadingDefinition } from './loading'
import type { pricesByAssetNameDefinition } from './prices-by-asset-name'

declare const selectorDefinitions: [
  typeof assetPriceDefinition,
  typeof assetRateDefinition,
  typeof fiatRatesDefinition,
  typeof getIsRateAvailableDefinition,
  typeof loadingDefinition,
  typeof pricesByAssetNameDefinition,
]

export default selectorDefinitions
