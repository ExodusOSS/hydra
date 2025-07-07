import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

const ratesReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    syncTime: (state, time) => ({
      ...state,
      ...time,
    }),
  },
  selectorDefinitions,
}

export default ratesReduxDefinition
