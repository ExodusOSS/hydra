import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
import { createSelector } from 'reselect'
import assetLoadingResultFunc from './helpers/asset-loading-result-func'

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
