import { createSelector } from 'reselect'
import { memoize } from '@exodus/basic-utils'
import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type {
  CreateAssetRateSelector,
  GetAssetPricesSelector,
  PriceRecord,
  TimeSelector,
} from '../../types.js'

import memoizeGetAssetPrices from './helpers/memoize-get-asset-price.js'

const createGetAssetHourlyPriceSelector = {
  id: 'getAssetHourlyPrice',
  selectorFactory: (
    getAssetHourlyPricesSelector: GetAssetPricesSelector,
    createAssetRateSelector: CreateAssetRateSelector,
    startOfHourTimeSelector: TimeSelector
  ) =>
    memoize((assetName: string) =>
      createSelector(
        (state: unknown) => getAssetHourlyPricesSelector(state)(assetName),
        createAssetRateSelector(assetName),
        startOfHourTimeSelector,
        (
          assetHourlyPrices: PriceRecord | undefined,
          rate: { price?: number } | undefined,
          currentTime: number
        ) => memoizeGetAssetPrices(assetHourlyPrices, rate, 'hourly', currentTime)
      )
    ),
  dependencies: [
    //
    { selector: 'getAssetHourlyPrices' },
    { selector: 'assetRate', module: 'rates' },
    { selector: 'startOfHour', module: 'time' },
  ],
} as const satisfies SelectorDefinition

export default createGetAssetHourlyPriceSelector
