import type initialState from './initial-state.js'
import type selectorDefinitions from './selectors/index.js'

declare const localeReduxDefinition: {
  id: 'locale'
  type: 'redux-module'
  initialState: typeof initialState
  selectorDefinitions: typeof selectorDefinitions
  eventReducers: any
}

export default localeReduxDefinition
