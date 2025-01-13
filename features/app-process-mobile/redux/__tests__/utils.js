import { setupRedux } from '@exodus/redux-dependency-injection'
import { combineReducers, createStore } from 'redux'
import appProcess from '..'

export function setup({ dependencies = [] } = {}) {
  const allDependencies = [...dependencies, appProcess]

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

  const { reducers, initialState } = redux
  const store = createStore(reducers, initialState, enhancers)

  return { ...redux, store }
}
