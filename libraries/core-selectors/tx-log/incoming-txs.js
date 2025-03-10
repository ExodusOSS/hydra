import lodash from 'lodash'
import { createSelector } from 'reselect'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

export const createGetAssetHasIncomingTxInActiveAccount =
  (assetName) => (getTxLogInActiveAccount) => {
    const txLog = getTxLogInActiveAccount(assetName)
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
  }

const createAssetHasIncomingTxSelectorCreator = (getTxLogInActiveAccountSelector) =>
  memoize((assetName) =>
    createSelector(
      getTxLogInActiveAccountSelector,
      createGetAssetHasIncomingTxInActiveAccount(assetName)
    )
  )

export default createAssetHasIncomingTxSelectorCreator
