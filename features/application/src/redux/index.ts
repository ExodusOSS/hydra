import selectorDefinitions from './selectors.js'
import eventReducers from './reducers.js'
import type { State } from './types.js'

const initialState: State = {
  isLoading: true,
  isLocked: true,
  isBackedUp: true,
  walletExists: true,
  hasPassphraseSet: true,
  isRestoring: false,
  lockHistory: [],
  autoLockTimer: null,
}

const applicationReduxDefinition = {
  id: 'application',
  type: 'redux-module',
  initialState,
  eventReducers,
  selectorDefinitions,
} as const

export default applicationReduxDefinition
