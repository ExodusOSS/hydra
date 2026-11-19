import { createSelector } from 'reselect'
import { memoize } from '@exodus/basic-utils'
import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { GetAssetPricesSelector } from '../../types.js'
import assetLoadingResultFunc from './helpers/asset-loading-result-func.js'

const selectorFactory = (getAssetMinutelyPricesSelector: GetAssetPricesSelector) =>
  memoize((assetName: string) =>
    createSelector(
      (state: unknown) => getAssetMinutelyPricesSelector(state)(assetName),
      assetLoadingResultFunc
    )
  )

const createAssetMinutelyMarketHistoryIsLoadingSelector = {
  id: 'createAssetMinutelyMarketHistoryLoading',
  selectorFactory,
  dependencies: [
    {
      selector: 'getAssetMinutelyPrices',
    },
  ],
} as const satisfies SelectorDefinition

export default createAssetMinutelyMarketHistoryIsLoadingSelector
