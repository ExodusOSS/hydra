import { createSelector } from 'reselect'
import { toBalanceOnly } from '../utils'

const selectorFactory = (optimisticByAssetSourceSelector) =>
  createSelector(optimisticByAssetSourceSelector, toBalanceOnly)

const optimisticByBaseAssetSourceSelector = {
  id: 'optimisticByBaseAssetSource',
  selectorFactory,
  dependencies: [
    //
    { selector: 'optimisticByBaseAssetSourceField' },
  ],
}

export default optimisticByBaseAssetSourceSelector
