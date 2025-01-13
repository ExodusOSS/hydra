import id from './id'
import initialState from './initial-state'
import selectorDefinitions from './selectors'

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
