// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { set } from '@exodus/basic-utils'
import { TxSet } from '@exodus/models'
import { createTxSet } from '../../utils.js'
import type { BatchingReducer, OverwriteTxsParams } from '../../../types.js'

const { unset } = lodash

const overwriteTxsReducer: BatchingReducer<OverwriteTxsParams> = (
  changes,
  action,
  { getCachedTxLog, getAssets }
) => {
  const { walletAccount, assetName, txs, notifyReceivedTxs } = action.payload
  const assets = getAssets()

  const cached = getCachedTxLog({ walletAccount, assetName }) ?? TxSet.EMPTY

  const newTxSet = createTxSet({ txs, coinName: assetName, assets })

  const setsAreEqual = newTxSet.deepEquals(cached)

  if (notifyReceivedTxs && !setsAreEqual) {
    const receivedTxLogItems = [...newTxSet].filter(
      (tx) => !(tx.txId && cached.get(tx.txId)) && tx.received
    )
    if (receivedTxLogItems.length > 0) {
      set(
        changes,
        ['newlyReceivedTxLogs', walletAccount, assetName],
        createTxSet({ txs: receivedTxLogItems, coinName: assetName, assets })
      )
    }
  }

  if (setsAreEqual) {
    unset(changes, ['txLogs', walletAccount, assetName])
    return changes
  }

  set(changes, ['txLogs', walletAccount, assetName], newTxSet)
  return changes
}

export default overwriteTxsReducer
