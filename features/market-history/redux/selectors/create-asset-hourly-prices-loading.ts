import { createSelector } from 'reselect'
import { memoize } from '@exodus/basic-utils'
import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { GetAssetPricesSelector } from '../../types.js'
import assetLoadingResultFunc from './helpers/asset-loading-result-func.js'

const selectorFactory = (getAssetHourlyPricesSelector: GetAssetPricesSelector) =>
  memoize((assetName: string) =>
    createSelector(
      (state: unknown) => getAssetHourlyPricesSelector(state)(assetName),
      assetLoadingResultFunc
    )
  )

const createAssetHourlyMarketHistoryIsLoadingSelector = {
  id: 'createAssetHourlyMarketHistoryLoading',
  selectorFactory,
  dependencies: [
    {
      selector: 'getAssetHourlyPrices',
    },
  ],
} as const satisfies SelectorDefinition

export default createAssetHourlyMarketHistoryIsLoadingSelector
