import lodash from 'lodash'
import { set } from '@exodus/basic-utils'
import { TxSet } from '@exodus/models'
import { createTxSet } from '../../utils.js'

const { unset } = lodash

export default function overwriteTxsReducer(changes, action, { getCachedTxLog, getAssets }) {
  const { walletAccount, assetName, txs, notifyReceivedTxs } = action.payload
  const assets = getAssets()

  const cached = getCachedTxLog({ walletAccount, assetName }) ?? TxSet.EMPTY

  const newTxSet = createTxSet({ txs, coinName: assetName, assets })

  const setsAreEqual = newTxSet.deepEquals(cached)

  if (notifyReceivedTxs && !setsAreEqual) {
    const receivedTxLogItems = [...newTxSet].filter((tx) => !cached.get(tx.txId) && tx.received)
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
