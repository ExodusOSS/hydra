import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

const remoteConfigReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    remoteConfig: (state, data) => ({ ...state, data, loaded: true }),
  },
  selectorDefinitions,
}

export default remoteConfigReduxDefinition
