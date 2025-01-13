import lodash from 'lodash'
import { set } from '@exodus/basic-utils'
import { TxSet } from '@exodus/models'

const { unset } = lodash

export default function clearTxsReducer(changes, action, { getCachedTxLog }) {
  const { walletAccount, assetName } = action.payload

  const cached = getCachedTxLog({ walletAccount, assetName }) ?? TxSet.EMPTY

  if (!TxSet.EMPTY.equals(cached)) {
    set(changes, ['txLogs', walletAccount, assetName], TxSet.EMPTY)
    return changes
  }

  unset(changes, ['txLogs', walletAccount, assetName])
  return changes
}
