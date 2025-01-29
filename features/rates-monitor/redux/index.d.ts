import type initialState from './initial-state'
import type selectorDefinitions from './selectors'

declare const ratesReduxDefinition: {
  id: 'rates'
  type: 'redux-module'
  initialState: typeof initialState
  selectorDefinitions: typeof selectorDefinitions
  eventReducers: any
}

export default ratesReduxDefinition
