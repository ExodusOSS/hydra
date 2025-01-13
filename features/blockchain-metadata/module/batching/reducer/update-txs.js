import { partition, set } from '@exodus/basic-utils'
import lodash from 'lodash'
import { createTxSet } from '../../utils.js'
import { TxSet } from '@exodus/models'

const { get, unset } = lodash

export default function updateTxsReducer(changes, action, { getAssets, getCachedTxLog }) {
  const assets = getAssets()
  const { walletAccount, assetName, txs } = action.payload

  const cached = getCachedTxLog({ walletAccount, assetName }) ?? TxSet.EMPTY
  const current = get(changes, ['txLogs', walletAccount, assetName]) ?? cached

  // iterate over txs in case it is a TxSet:
  const [existingLogItems, newTxs] = partition([...txs], (v) => current.get(v.txId))

  const newLogItems = createTxSet({ txs: newTxs, coinName: assetName, assets })
  const receivedTxLogItems = [...newLogItems].filter((tx) => tx.received)

  if (receivedTxLogItems.length > 0) {
    set(
      changes,
      ['newlyReceivedTxLogs', walletAccount, assetName],
      createTxSet({ txs: receivedTxLogItems, coinName: assetName, assets })
    )
  }

  let newTxSet = current

  if (existingLogItems.length > 0) {
    newTxSet = newTxSet.updateTxsProperties(existingLogItems)
  }

  if (newLogItems.size > 0) {
    newTxSet = newTxSet.union(newLogItems)
  }

  if (newTxSet.deepEquals(cached)) {
    unset(changes, ['txLogs', walletAccount, assetName])
    return changes
  }

  set(changes, ['txLogs', walletAccount, assetName], newTxSet)
  return changes
}
