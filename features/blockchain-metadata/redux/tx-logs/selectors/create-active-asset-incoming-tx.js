import lodash from 'lodash'
import { createSelector } from 'reselect'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const EMPTY_ARRAY = []

export const createActiveAssetIncomingTxSelectorDefinition = {
  id: 'createActiveAssetIncomingTxSelector',
  selectorFactory: (createActiveAssetSourceSelector) =>
    memoize((assetName) => {
      return createSelector(createActiveAssetSourceSelector(assetName), (txLog) => {
        if (!txLog || txLog.size === 0) {
          return EMPTY_ARRAY
        }

        const txs = []
        for (let index = txLog.size - 1; index >= 0; index--) {
          const tx = txLog.getAt(index)
          if (tx.pending && !tx.sent && !tx.failed) {
            txs.push(tx)
          }
        }

        return txs.length > 0 ? txs : EMPTY_ARRAY
      })
    }),
  dependencies: [
    //
    { selector: 'createActiveAssetSourceSelector' },
  ],
}
