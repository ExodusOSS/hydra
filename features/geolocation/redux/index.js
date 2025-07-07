import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

const geolocationReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    geolocation: (state, data) => {
      return data.error
        ? { ...state, loaded: true, error: data.error }
        : { ...state, loaded: true, data }
    },
  },
  selectorDefinitions,
}

export default geolocationReduxDefinition
