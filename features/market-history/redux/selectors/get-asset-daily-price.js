import { createSelector } from 'reselect'
import memoizeGetAssetPrice from './helpers/memoize-get-asset-price.js'
import { memoize } from '@exodus/basic-utils'

const createGetAssetDailyPriceSelector = {
  id: 'getAssetDailyPrice',
  selectorFactory: (
    getAssetDailyPricesSelector,
    createAssetRateSelector,
    startOfHourTimeSelector
  ) =>
    memoize((assetName) =>
      createSelector(
        (state) => getAssetDailyPricesSelector(state)(assetName),
        createAssetRateSelector(assetName),
        startOfHourTimeSelector,
        (assetDailyPrices, rate, currentTime) =>
          memoizeGetAssetPrice(assetDailyPrices, rate, 'daily', currentTime)
      )
    ),
  dependencies: [
    //
    { selector: 'getAssetDailyPrices' },
    { selector: 'assetRate', module: 'rates' },
    { selector: 'startOfHour', module: 'time' },
  ],
}

export default createGetAssetDailyPriceSelector
