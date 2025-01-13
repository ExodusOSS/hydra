import { combineReducers, createStore } from 'redux'
import { setupRedux } from '@exodus/redux-dependency-injection'
import createUiConfigReduxDefinition from '../index.js'

export function setup({ dependencies = [] } = {}) {
  const config = {
    assetsShowPriceMap: {
      id: 'assetsShowPriceMap',
    },
  }
  const reduxDefinition = createUiConfigReduxDefinition(config)
  const allDependencies = [...dependencies, reduxDefinition]
  const enhancers = (createStore) => (reducers, initialState, enhancer) => {
    const reducer = combineReducers(reducers)
    return createStore(reducer, initialState, enhancer)
  }

  const redux = setupRedux({
    // override default deps with provided by de-duping
    dependencies: allDependencies.filter(
      (dep, i) => allDependencies.findIndex((other) => dep.id === other.id) === i
    ),
  })

  const { createHandleEvent, reducers, initialState } = redux
  const store = createStore(reducers, initialState, enhancers)
  const handleEvent = createHandleEvent(store)

  const eventName = Object.keys(reduxDefinition.eventReducers)[0]
  const emitAssetsShowPriceMap = (payload) => handleEvent(eventName, payload)

  return {
    ...redux,
    store,
    emitAssetsShowPriceMap,
  }
}
