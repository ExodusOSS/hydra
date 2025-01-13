/* eslint-disable import/no-unresolved */

import assert from 'assert'
import { combineReducers } from 'redux'

const modularRedux = (createStore) => (reducers, initialState, enhancer) => {
  const currentReducers = reducers

  const reducer = combineReducers(reducers)
  const store = createStore(reducer, initialState, enhancer)

  store.injectReducer = (key, reducer) => {
    assert(!currentReducers[key], `Modular Redux: Reducer ${key} already registered`)

    currentReducers[key] = reducer

    store.replaceReducer(combineReducers(currentReducers))
  }

  return store
}

export * from './utils'

export default modularRedux
