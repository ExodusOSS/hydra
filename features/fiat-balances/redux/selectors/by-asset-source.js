import { createSelector } from 'reselect'
import { toBalanceOnly } from './utils'

const selectorFactory = (byAssetSourceSelector) =>
  createSelector(byAssetSourceSelector, toBalanceOnly)

const byAssetSourceSelector = {
  id: 'byAssetSource',
  selectorFactory,
  dependencies: [
    //
    { selector: 'byAssetSourceField' },
  ],
}

export default byAssetSourceSelector
