import lodash from 'lodash'
import { set } from '@exodus/basic-utils'
import { TxSet } from '@exodus/models'

const { get, unset } = lodash

export default function removeTxsReducer(changes, action, { getCachedTxLog }) {
  const { walletAccount, assetName, txs } = action.payload

  const cached = getCachedTxLog({ walletAccount, assetName }) ?? TxSet.EMPTY
  const current = get(changes, ['txLogs', walletAccount, assetName]) ?? cached

  const txIds = txs.map((tx) => tx.txId)
  const newTxSet = txIds.reduce((txSet, txId) => txSet.delete(txId), current)

  if (newTxSet === cached) {
    unset(changes, ['txLogs', walletAccount, assetName])
    return changes
  }

  set(changes, ['txLogs', walletAccount, assetName], newTxSet)
  return changes
}
