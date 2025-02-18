import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

const ratesReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    currency: (state, currency) => ({
      ...state,
      currency,
    }),
    language: (state, language) => ({
      ...state,
      language,
    }),
  },
  selectorDefinitions,
}

export default ratesReduxDefinition
