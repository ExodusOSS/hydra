import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'

const selectorFactory = (createAssetRateSelector) =>
  memoize((assetName) => createSelector(createAssetRateSelector(assetName), (rate) => rate?.price))

const createAssetPriceSelector = {
  id: 'assetPrice',
  selectorFactory,
  dependencies: [
    //
    { selector: 'assetRate' },
  ],
}

export default createAssetPriceSelector
