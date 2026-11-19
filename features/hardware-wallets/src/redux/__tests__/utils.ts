import { type ContainerDependency, setupRedux } from '@exodus/redux-dependency-injection'
import { createStore } from 'redux'

import reduxModule from '../index.js'

export function setup<const Deps extends readonly ContainerDependency[] = readonly []>({
  dependencies,
}: { dependencies?: Deps } = {}) {
  const allDependencies = [...(dependencies ?? []), reduxModule]

  const redux = setupRedux({
    dependencies: allDependencies.filter(
      (dep, i) => allDependencies.findIndex((other) => dep.id === other.id) === i
    ),
  })

  const { createHandleEvent, combinedReducer } = redux
  const store = createStore(combinedReducer)
  const handleEvent = createHandleEvent(store)

  const emit = (evt: string, data: unknown) => handleEvent(evt, data)

  return { ...redux, store, emit }
}
