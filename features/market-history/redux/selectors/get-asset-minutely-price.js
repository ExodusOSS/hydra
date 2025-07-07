import { createSelector } from 'reselect'
import memoizeGetAssetPrices from './helpers/memoize-get-asset-price.js'
import { memoize } from '@exodus/basic-utils'

const createGetAssetMinutelyPriceSelector = {
  id: 'getAssetMinutelyPrice',
  selectorFactory: (
    getAssetMinutelyPricesSelector,
    createAssetRateSelector,
    startOfMinuteTimeSelector
  ) =>
    memoize((assetName) =>
      createSelector(
        (state) => getAssetMinutelyPricesSelector(state)(assetName),
        createAssetRateSelector(assetName),
        startOfMinuteTimeSelector,
        (assetMinutelyPrices, rate, currentTime) =>
          memoizeGetAssetPrices(assetMinutelyPrices, rate, 'minutely', currentTime)
      )
    ),
  dependencies: [
    //
    { selector: 'getAssetMinutelyPrices' },
    { selector: 'assetRate', module: 'rates' },
    { selector: 'startOfMinute', module: 'time' },
  ],
}

export default createGetAssetMinutelyPriceSelector
