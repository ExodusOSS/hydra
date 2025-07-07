import { createSelector } from 'reselect'
import assetLoadingResultFunc from './helpers/asset-loading-result-func.js'
import { memoize } from '@exodus/basic-utils'

const selectorFactory = (getAssetHourlyPricesSelector) =>
  memoize((assetName) =>
    createSelector(
      (state) => getAssetHourlyPricesSelector(state)(assetName),
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
}

export default createAssetHourlyMarketHistoryIsLoadingSelector
