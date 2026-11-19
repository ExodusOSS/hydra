import { createSelector } from 'reselect'
import { memoize } from '@exodus/basic-utils'
import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { GetAssetPricesSelector } from '../../types.js'
import assetLoadingResultFunc from './helpers/asset-loading-result-func.js'

const selectorFactory = (getAssetDailyPricesSelector: GetAssetPricesSelector) =>
  memoize((assetName: string) =>
    createSelector(
      (state: unknown) => getAssetDailyPricesSelector(state)(assetName),
      assetLoadingResultFunc
    )
  )

const createAssetDailyMarketHistoryIsLoadingSelector = {
  id: 'createAssetDailyMarketHistoryLoading',
  selectorFactory,
  dependencies: [
    {
      selector: 'getAssetDailyPrices',
    },
  ],
} as const satisfies SelectorDefinition

export default createAssetDailyMarketHistoryIsLoadingSelector
