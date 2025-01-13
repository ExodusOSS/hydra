import { setupRedux } from '../src/index.js'
import { combineReducers, createStore } from 'redux'

export function createRedux({
  eventReducers,
  actionReducers,
  createLogger,
  selectorDefinitions,
  externalSelectors,
}) {
  const moduleDefinition = {
    id: 'batmobile',
    type: 'redux-module',
    initialState: {},
    eventReducers,
    actionReducers,
    selectorDefinitions,
  }

  const combineReducersMiddleware = (createStore) => (reducers, initialState, enhancer) => {
    const reducer = combineReducers(reducers)
    return createStore(reducer, initialState, enhancer)
  }

  const { reducers, initialState, createHandleEvent, selectors } = setupRedux({
    dependencies: [moduleDefinition, ...(externalSelectors || [])],
    createLogger,
  })

  const store = createStore(reducers, initialState, combineReducersMiddleware)

  return {
    store,
    selectors,
    handleEvent: createHandleEvent(store),
  }
}
