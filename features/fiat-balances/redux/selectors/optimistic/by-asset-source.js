import { createSelector } from 'reselect'
import { toBalanceOnly } from '../utils.js'

const selectorFactory = (optimisticByAssetSourceFieldSelector) =>
  createSelector(optimisticByAssetSourceFieldSelector, toBalanceOnly)

const optimisticByAssetSource = {
  id: 'optimisticByAssetSource',
  selectorFactory,
  dependencies: [
    //
    { selector: 'optimisticByAssetSourceField' },
  ],
}

export default optimisticByAssetSource
