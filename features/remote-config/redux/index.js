import id from './id'
import initialState from './initial-state'
import selectorDefinitions from './selectors'

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
