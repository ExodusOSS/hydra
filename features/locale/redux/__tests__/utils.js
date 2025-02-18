import { setupRedux } from '@exodus/redux-dependency-injection'
import { combineReducers, createStore } from 'redux'

import ratesReduxDefinition from '../index.js'

export function setup({ dependencies = [] } = {}) {
  const allDependencies = [...dependencies, ratesReduxDefinition]
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

  const emitCurrency = (currency) => handleEvent('currency', currency)
  const emitLanguage = (currency) => handleEvent('language', currency)

  return { ...redux, store, emitLanguage, emitCurrency }
}
