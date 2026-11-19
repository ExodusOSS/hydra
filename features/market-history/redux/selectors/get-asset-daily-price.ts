import { createSelector } from 'reselect'
import { memoize } from '@exodus/basic-utils'
import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type {
  CreateAssetRateSelector,
  GetAssetPricesSelector,
  PriceRecord,
  TimeSelector,
} from '../../types.js'

import memoizeGetAssetPrice from './helpers/memoize-get-asset-price.js'

const createGetAssetDailyPriceSelector = {
  id: 'getAssetDailyPrice',
  selectorFactory: (
    getAssetDailyPricesSelector: GetAssetPricesSelector,
    createAssetRateSelector: CreateAssetRateSelector,
    startOfHourTimeSelector: TimeSelector
  ) =>
    memoize((assetName: string) =>
      createSelector(
        (state: unknown) => getAssetDailyPricesSelector(state)(assetName),
        createAssetRateSelector(assetName),
        startOfHourTimeSelector,
        (
          assetDailyPrices: PriceRecord | undefined,
          rate: { price?: number } | undefined,
          currentTime: number
        ) => memoizeGetAssetPrice(assetDailyPrices, rate, 'daily', currentTime)
      )
    ),
  dependencies: [
    //
    { selector: 'getAssetDailyPrices' },
    { selector: 'assetRate', module: 'rates' },
    { selector: 'startOfHour', module: 'time' },
  ],
} as const satisfies SelectorDefinition

export default createGetAssetDailyPriceSelector
