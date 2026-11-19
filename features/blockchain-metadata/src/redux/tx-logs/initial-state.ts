import helper from './multi-account-helper.js'
import type { TxLogsReduxState } from '../../types.js'

// allow: upstream createInitialState returns loosely typed SliceState; this slice only ever stores TxSet data
const initialState = helper.createInitialState() as TxLogsReduxState

export default initialState
