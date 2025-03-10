import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

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
