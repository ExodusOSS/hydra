import type initialState from './initial-state.js'
import type selectorDefinitions from './selectors/index.js'

declare const ratesReduxDefinition: {
  id: 'rates'
  type: 'redux-module'
  initialState: typeof initialState
  selectorDefinitions: typeof selectorDefinitions
  eventReducers: any
}

export default ratesReduxDefinition
