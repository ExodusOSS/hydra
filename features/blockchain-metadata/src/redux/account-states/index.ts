import type { ReduxModuleDefinition } from '@exodus/redux-dependency-injection'
import defaultReducer from '../default-reducer.js'
import id from './id.js'
import initialState from './initial-state.js'
import helper from './multi-account-helper.js'
import type { AccountStateMap, AccountStatesReduxState } from '../../types.js'

type AccountStatesPayload = {
  value?: AccountStateMap
  changes?: AccountStateMap
}

const accountStatesReduxModuleDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    accountStates: (state: AccountStatesReduxState, payload: AccountStatesPayload) => {
      // allow: defaultReducer cannot type this slice's extra defaultAccountStates key
      const newState = defaultReducer(state, payload) as AccountStatesReduxState
      return {
        ...newState,
        defaultAccountStates: newState.defaultAccountStates || state.defaultAccountStates,
        // allow: spreading into a literal drops the wallet-account index signature, so the intersection state type is not constructible without a cast
      } as AccountStatesReduxState
    },
    assets: (
      state: AccountStatesReduxState,
      {
        defaultAccountStates,
      }: { defaultAccountStates: AccountStatesReduxState['defaultAccountStates'] }
    ) =>
      ({
        ...state,
        defaultAccountStates,
        // allow: spreading into a literal drops the wallet-account index signature, so the intersection state type is not constructible without a cast
      }) as AccountStatesReduxState,
  },
  selectorDefinitions: helper.selectorDefinitions,
} as const satisfies ReduxModuleDefinition<AccountStatesReduxState>

export default accountStatesReduxModuleDefinition
