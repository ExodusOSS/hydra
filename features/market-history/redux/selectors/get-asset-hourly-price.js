import { createSelector } from 'reselect'
import memoizeGetAssetPrices from './helpers/memoize-get-asset-price.js'
import { memoize } from '@exodus/basic-utils'

const createGetAssetHourlyPriceSelector = {
  id: 'getAssetHourlyPrice',
  selectorFactory: (
    getAssetHourlyPricesSelector,
    createAssetRateSelector,
    startOfHourTimeSelector
  ) =>
    memoize((assetName) =>
      createSelector(
        (state) => getAssetHourlyPricesSelector(state)(assetName),
        createAssetRateSelector(assetName),
        startOfHourTimeSelector,
        (assetHourlyPrices, rate, currentTime) =>
          memoizeGetAssetPrices(assetHourlyPrices, rate, 'hourly', currentTime)
      )
    ),
  dependencies: [
    //
    { selector: 'getAssetHourlyPrices' },
    { selector: 'assetRate', module: 'rates' },
    { selector: 'startOfHour', module: 'time' },
  ],
}

export default createGetAssetHourlyPriceSelector
