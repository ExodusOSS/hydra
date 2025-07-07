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
      currencyLoaded: true,
    }),
    language: (state, language) => ({
      ...state,
      language,
      languageLoaded: true,
    }),
  },
  selectorDefinitions,
}

export default ratesReduxDefinition
