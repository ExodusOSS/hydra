import { partition, set } from '@exodus/basic-utils'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createTxSet } from '../../utils.js'
import { TxSet } from '@exodus/models'
import type { BatchingReducer, TxInput, TxParams } from '../../../types.js'

const { get, unset } = lodash

export const createUpdateTxsReducer =
  ({ addOnly = false }: { addOnly?: boolean } = {}): BatchingReducer<TxParams> =>
  (changes, action, { getAssets, getCachedTxLog }) => {
    const assets = getAssets()
    const { walletAccount, assetName, txs } = action.payload

    const cached = getCachedTxLog({ walletAccount, assetName }) ?? TxSet.EMPTY
    const current = get(changes, ['txLogs', walletAccount, assetName]) ?? cached

    const isExistingLogItem = (tx: TxInput): tx is TxInput & { txId: string } =>
      Boolean(current.get(tx.txId!))

    const [existingLogItems, newTxs] = partition([...txs], isExistingLogItem)

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

    if (!addOnly && existingLogItems.length > 0) {
      newTxSet = newTxSet.updateTxsProperties(existingLogItems)
    } else if (existingLogItems.length > 0) {
      console.warn('tried to add existing txLog items', existingLogItems)
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

export default createUpdateTxsReducer()
