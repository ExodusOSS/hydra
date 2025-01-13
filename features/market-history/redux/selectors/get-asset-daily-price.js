import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
import { createSelector } from 'reselect'
import memoizeGetAssetPrice from './helpers/memoize-get-asset-price'

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
