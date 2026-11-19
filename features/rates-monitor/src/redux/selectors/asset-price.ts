import { memoize } from '@exodus/basic-utils'
import { defineSelectorFactory } from '@exodus/redux-dependency-injection'
import { createSelector } from 'reselect'

import type { CreateAssetRateSelector } from './asset-rate.js'

const selectorFactory = (createAssetRateSelector: CreateAssetRateSelector) =>
  memoize((assetName: string) =>
    createSelector(createAssetRateSelector(assetName), (rate) => rate?.price)
  )

const createAssetPriceSelector = defineSelectorFactory({
  id: 'assetPrice',
  selectorFactory,
  dependencies: [
    //
    { selector: 'assetRate' },
  ],
})

export default createAssetPriceSelector
