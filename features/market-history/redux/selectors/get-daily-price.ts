import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { Asset, GetPriceFn, PriceRecord } from '../../types.js'

import memoizeGetPrices from './helpers/memoize-get-price.js'

const resultFunction = (
  getAssetDailyPrices: (assetName: string) => PriceRecord | Error,
  rates: Record<string, { price?: number }>,
  getAsset: (assetName: string) => Asset,
  startOfHourTime: number
): GetPriceFn => memoizeGetPrices(getAssetDailyPrices, rates, 'daily', getAsset, startOfHourTime)

const getDailyPriceSelector = {
  id: 'getDailyPrice',
  resultFunction,
  dependencies: [
    //
    { selector: 'getAssetDailyPrices' },
    { selector: 'fiatRates', module: 'rates' },
    { module: 'assets', selector: 'getAsset' },
    { selector: 'startOfHour', module: 'time' },
  ],
} as const satisfies SelectorDefinition

export default getDailyPriceSelector
