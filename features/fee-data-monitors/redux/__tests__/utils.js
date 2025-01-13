import assetsFeatureReduxDefinition from '@exodus/assets-feature/redux/index.js'
import { setupRedux } from '@exodus/redux-dependency-injection'
import { combineReducers, createStore } from 'redux'

import feeDataReduxDefinition from '../index.js'

export function setup() {
  const allDependencies = [feeDataReduxDefinition, assetsFeatureReduxDefinition]

  const enhancers = (createStore) => (reducers, initialState, enhancer) => {
    const reducer = combineReducers(reducers)
    return createStore(reducer, initialState, enhancer)
  }

  const redux = setupRedux({ dependencies: allDependencies })

  const { createHandleEvent, reducers, initialState } = redux

  const store = createStore(reducers, initialState, enhancers)

  const handleEvent = createHandleEvent(store)

  return { ...redux, store, handleEvent }
}
