import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
import { createSelector } from 'reselect'
import assetLoadingResultFunc from './helpers/asset-loading-result-func'

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
