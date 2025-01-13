import id from './id'
import initialState from './initial-state'
import selectorDefinitions from './selectors'

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
