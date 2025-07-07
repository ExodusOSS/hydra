import { createSelector } from 'reselect'
import assetLoadingResultFunc from './helpers/asset-loading-result-func.js'
import { memoize } from '@exodus/basic-utils'

const selectorFactory = (getAssetDailyPricesSelector) =>
  memoize((assetName) =>
    createSelector((state) => getAssetDailyPricesSelector(state)(assetName), assetLoadingResultFunc)
  )

const createAssetDailyMarketHistoryIsLoadingSelector = {
  id: 'createAssetDailyMarketHistoryLoading',
  selectorFactory,
  dependencies: [
    {
      selector: 'getAssetDailyPrices',
    },
  ],
}

export default createAssetDailyMarketHistoryIsLoadingSelector
