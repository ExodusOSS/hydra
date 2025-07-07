import { createSelector } from 'reselect'
import { toBalanceOnly } from './utils.js'

const selectorFactory = (byAssetSourceSelector) =>
  createSelector(byAssetSourceSelector, toBalanceOnly)

const byBaseAssetSourceSelector = {
  id: 'byBaseAssetSource',
  selectorFactory,
  dependencies: [
    //
    { selector: 'byBaseAssetSourceField' },
  ],
}

export default byBaseAssetSourceSelector
