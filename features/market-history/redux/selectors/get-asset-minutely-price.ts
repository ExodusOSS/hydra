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

const createGetAssetMinutelyPriceSelector = {
  id: 'getAssetMinutelyPrice',
  selectorFactory: (
    getAssetMinutelyPricesSelector: GetAssetPricesSelector,
    createAssetRateSelector: CreateAssetRateSelector,
    startOfMinuteTimeSelector: TimeSelector
  ) =>
    memoize((assetName: string) =>
      createSelector(
        (state: unknown) => getAssetMinutelyPricesSelector(state)(assetName),
        createAssetRateSelector(assetName),
        startOfMinuteTimeSelector,
        (
          assetMinutelyPrices: PriceRecord | undefined,
          rate: { price?: number } | undefined,
          currentTime: number
        ) => memoizeGetAssetPrices(assetMinutelyPrices, rate, 'minutely', currentTime)
      )
    ),
  dependencies: [
    //
    { selector: 'getAssetMinutelyPrices' },
    { selector: 'assetRate', module: 'rates' },
    { selector: 'startOfMinute', module: 'time' },
  ],
} as const satisfies SelectorDefinition

export default createGetAssetMinutelyPriceSelector
