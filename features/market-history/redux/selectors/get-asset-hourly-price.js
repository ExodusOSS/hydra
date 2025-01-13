import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file

import { createSelector } from 'reselect'
import memoizeGetAssetPrices from './helpers/memoize-get-asset-price'

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
