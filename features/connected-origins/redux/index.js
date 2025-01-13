import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

const connectedOriginsReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    connectedOrigins: (state, data) => ({ ...state, data }),
  },
  selectorDefinitions,
}

export default connectedOriginsReduxDefinition
