import { createSelector } from 'reselect'
import assetLoadingResultFunc from './helpers/asset-loading-result-func.js'
import { memoize } from '@exodus/basic-utils'

const selectorFactory = (getAssetMinutelyPricesSelector) =>
  memoize((assetName) =>
    createSelector(
      (state) => getAssetMinutelyPricesSelector(state)(assetName),
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
}

export default createAssetMinutelyMarketHistoryIsLoadingSelector
