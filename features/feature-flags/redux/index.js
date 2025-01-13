import id from './id'
import initialState from './initial-state'
import selectorDefinitions from './selectors'

const featureFlagsReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    featureFlags: (state, data) => ({ ...state, loaded: true, data }),
  },
  selectorDefinitions,
}

export default featureFlagsReduxDefinition
