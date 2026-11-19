import removeAccountStateReducer from './remove-account-state.js'
import Action from '../action.js'
import updateAccountStateReducer from './update-account-state.js'
import updateTxsReducer from './update-txs.js'
import addTxsReducer from './add-txs.js'
import removeTxsReducer from './remove-txs.js'
import overwriteTxsReducer from './overwrite-txs.js'
import clearTxsReducer from './clear-txs.js'
import type { BatchingReducer } from '../../../types.js'

const reducers: Map<symbol, BatchingReducer> = new Map([
  [Action.RemoveAccountState, removeAccountStateReducer],
  [Action.UpdateAccountState, updateAccountStateReducer],
  [Action.AddTxs, addTxsReducer],
  [Action.UpdateTxs, updateTxsReducer],
  [Action.RemoveTxs, removeTxsReducer],
  [Action.OverwriteTxs, overwriteTxsReducer],
  [Action.ClearTxs, clearTxsReducer],
])

export default function getReducer(actionType: symbol): BatchingReducer | undefined {
  return reducers.get(actionType)
}
