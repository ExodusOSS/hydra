import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { Asset, GetPriceFn, PriceRecord } from '../../types.js'

import memoizeGetPrices from './helpers/memoize-get-price.js'

const resultFunction = (
  getAssetHourlyPrices: (assetName: string) => PriceRecord | Error,
  rates: Record<string, { price?: number }>,
  getAsset: (assetName: string) => Asset,
  startOfHourTime: number
): GetPriceFn => memoizeGetPrices(getAssetHourlyPrices, rates, 'hourly', getAsset, startOfHourTime)

const getHourlyPriceSelector = {
  id: 'getHourlyPrice',
  resultFunction,
  dependencies: [
    //
    { selector: 'getAssetHourlyPrices' },
    { selector: 'fiatRates', module: 'rates' },
    { module: 'assets', selector: 'getAsset' },
    { selector: 'startOfHour', module: 'time' },
  ],
} as const satisfies SelectorDefinition

export default getHourlyPriceSelector
