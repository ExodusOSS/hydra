import lodash from 'lodash'
import { createSelector } from 'reselect'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

export const createActiveAssetHasIncomingTxSelectorDefinition = {
  id: 'createActiveAssetHasIncomingTxSelector',
  selectorFactory: (createActiveAssetSourceSelector) =>
    memoize((assetName) => {
      return createSelector(createActiveAssetSourceSelector(assetName), (txLog) => {
        if (!txLog || txLog.size === 0) {
          return false
        }

        for (let index = txLog.size - 1; index >= 0; index--) {
          const tx = txLog.getAt(index)
          if (tx.pending && !tx.sent && !tx.failed) {
            return true
          }
        }

        return false
      })
    }),
  dependencies: [
    //
    { selector: 'createActiveAssetSourceSelector' },
  ],
}
