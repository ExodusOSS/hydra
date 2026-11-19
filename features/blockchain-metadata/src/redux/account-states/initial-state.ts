import helper from './multi-account-helper.js'
import type { AccountStatesReduxState } from '../../types.js'

const initialState: AccountStatesReduxState = {
  ...helper.createInitialState(),
  defaultAccountStates: {},
  // allow: spreading into a literal drops the wallet-account index signature, so the intersection state type is not constructible without a cast
} as AccountStatesReduxState

export default initialState
