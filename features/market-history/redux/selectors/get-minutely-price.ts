import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { Asset, GetPriceFn, PriceRecord } from '../../types.js'

import memoizeGetPrices from './helpers/memoize-get-price.js'

const resultFunction = (
  getAssetMinutelyPrices: (assetName: string) => PriceRecord | Error,
  rates: Record<string, { price?: number }>,
  getAsset: (assetName: string) => Asset,
  startOfMinuteTime: number
): GetPriceFn =>
  memoizeGetPrices(getAssetMinutelyPrices, rates, 'minutely', getAsset, startOfMinuteTime)

const getMinutelyPriceSelector = {
  id: 'getMinutelyPrice',
  resultFunction,
  dependencies: [
    //
    { selector: 'getAssetMinutelyPrices' },
    { selector: 'fiatRates', module: 'rates' },
    { module: 'assets', selector: 'getAsset' },
    { selector: 'startOfMinute', module: 'time' },
  ],
} as const satisfies SelectorDefinition

export default getMinutelyPriceSelector
