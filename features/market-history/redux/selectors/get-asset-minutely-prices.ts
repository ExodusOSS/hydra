import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { AssetPrices, PriceRecord } from '../../types.js'

const resultFunction =
  (prices: AssetPrices) =>
  (assetName: string): PriceRecord | undefined =>
    prices[assetName]

const getAssetMinutelyPricesSelector = {
  id: 'getAssetMinutelyPrices',
  resultFunction,
  dependencies: [
    //
    { selector: 'minutelyPrices' },
  ],
} as const satisfies SelectorDefinition

export default getAssetMinutelyPricesSelector
