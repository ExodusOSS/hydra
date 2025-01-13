import defaultReducer from '../default-reducer.js'
import id from './id.js'
import initialState from './initial-state.js'
import helper from './multi-account-helper.js'

const accountStatesReduxModuleDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    accountStates: (state, payload) => {
      const newState = defaultReducer(state, payload)
      return {
        ...newState,
        defaultAccountStates: newState.defaultAccountStates || state.defaultAccountStates,
      }
    },
    assets: (state, { defaultAccountStates }) => ({
      ...state,
      defaultAccountStates,
    }),
  },
  selectorDefinitions: helper.selectorDefinitions,
}

export default accountStatesReduxModuleDefinition
