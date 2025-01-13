import id from './id'
import initialState from './initial-state'
import selectorDefinitions from './selectors'

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
