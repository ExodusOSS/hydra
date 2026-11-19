// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { set } from '@exodus/basic-utils'
import { TxSet } from '@exodus/models'
import type { BatchingReducer, TxParams } from '../../../types.js'

const { get, unset } = lodash

const removeTxsReducer: BatchingReducer<TxParams> = (changes, action, { getCachedTxLog }) => {
  const { walletAccount, assetName, txs } = action.payload

  const cached = getCachedTxLog({ walletAccount, assetName }) ?? TxSet.EMPTY
  const current = get(changes, ['txLogs', walletAccount, assetName]) ?? cached

  const txIds = txs.map((tx) => tx.txId!)
  const newTxSet = txIds.reduce((txSet: TxSet, txId: string) => txSet.delete(txId), current)

  if (newTxSet === cached) {
    unset(changes, ['txLogs', walletAccount, assetName])
    return changes
  }

  set(changes, ['txLogs', walletAccount, assetName], newTxSet)
  return changes
}

export default removeTxsReducer
