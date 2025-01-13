import { assetPriceDefinition } from './asset-price'
import { assetRateDefinition } from './asset-rate'
import { fiatRatesDefinition } from './fiat-rates'
import { getIsRateAvailableDefinition } from './get-is-rate-available'
import { loadingDefinition } from './loading'
import { pricesByAssetNameDefinition } from './prices-by-asset-name'

declare const selectorDefinitions: [
  typeof assetPriceDefinition,
  typeof assetRateDefinition,
  typeof fiatRatesDefinition,
  typeof getIsRateAvailableDefinition,
  typeof loadingDefinition,
  typeof pricesByAssetNameDefinition,
]

export default selectorDefinitions
