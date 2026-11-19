import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { AssetPrices, PriceRecord } from '../../types.js'

const resultFunction =
  (dailyPrices: AssetPrices) =>
  (assetName: string): PriceRecord | undefined =>
    dailyPrices[assetName]

const getAssetDailyPricesSelector = {
  id: 'getAssetDailyPrices',
  resultFunction,
  dependencies: [
    //
    { selector: 'dailyPrices' },
  ],
} as const satisfies SelectorDefinition

export default getAssetDailyPricesSelector
