import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
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
