import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { AssetPrices, PriceRecord } from '../../types.js'

const resultFunction =
  (prices: AssetPrices) =>
  (assetName: string): PriceRecord | undefined =>
    prices[assetName]

const getAssetHourlyPricesSelector = {
  id: 'getAssetHourlyPrices',
  resultFunction,
  dependencies: [
    //
    { selector: 'hourlyPrices' },
  ],
} as const satisfies SelectorDefinition

export default getAssetHourlyPricesSelector
