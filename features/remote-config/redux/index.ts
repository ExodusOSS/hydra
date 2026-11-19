import id from './id.js'
import initialState, { type State } from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

const remoteConfigReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    remoteConfig: (state: State, data: State['data']): State => ({
      ...state,
      data,
      loaded: true,
    }),
  },
  selectorDefinitions,
} as const

export default remoteConfigReduxDefinition
