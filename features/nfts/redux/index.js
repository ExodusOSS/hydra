import id from './id'
import initialState from './initial-state'
import eventReducers from './event-reducers'
import selectorDefinitions from './selectors'

const nftsReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers,
  selectorDefinitions,
}

export default nftsReduxDefinition
