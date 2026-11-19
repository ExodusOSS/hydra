import type { ReduxModuleDefinition } from '@exodus/redux-dependency-injection'
import { setupRedux } from '@exodus/redux-dependency-injection'
import { combineReducers, createStore, type Reducer, type ReducersMapObject } from 'redux'

import remoteConfigReduxDefinition from '../index.js'

type Deps = [typeof remoteConfigReduxDefinition]

export function setup({ dependencies = [] }: { dependencies?: ReduxModuleDefinition[] } = {}) {
  const allDependencies: ReduxModuleDefinition[] = [...dependencies, remoteConfigReduxDefinition]

  const redux = setupRedux<{ dependencies: Deps }>({
    // override default deps with provided by de-duping
    dependencies: allDependencies.filter(
      (dep, i) => allDependencies.findIndex((other) => dep.id === other.id) === i
    ) as Deps,
  })

  const { createHandleEvent, reducers, initialState } = redux
  const rootReducer = combineReducers(reducers as ReducersMapObject) as Reducer
  const store = createStore(rootReducer, initialState)
  const handleEvent = createHandleEvent(store)

  return { ...redux, store, handleEvent }
}
