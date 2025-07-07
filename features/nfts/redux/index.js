import id from './id.js'
import initialState from './initial-state.js'
import eventReducers from './event-reducers.js'
import selectorDefinitions from './selectors/index.js'

const nftsReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers,
  selectorDefinitions,
}

export default nftsReduxDefinition
