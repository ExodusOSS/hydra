import type { Logger } from '@exodus/logger'

import type { ReduxModuleDefinition, SelectorDefinition } from '../src/index.js'
import { createReduxStore, setupRedux } from '../src/index.js'

type ExternalSelectorDependency = {
  id: string
  factory: (...args: unknown[]) => unknown
  type?: string
  dependencies?: readonly string[]
}

type CreateReduxParams = {
  eventReducers?: ReduxModuleDefinition['eventReducers']
  actionReducers?: ReduxModuleDefinition['actionReducers']
  createLogger?: (scope: string) => Logger
  selectorDefinitions?: readonly SelectorDefinition[]
  externalSelectors?: readonly ExternalSelectorDependency[]
  moduleDefinition?: ReduxModuleDefinition
}

type TestSelectors = {
  batmobile: Record<string, (...args: unknown[]) => unknown> & {
    driver: (state: unknown) => unknown
    animals: (state: unknown) => unknown
    summary: (state: unknown) => unknown
    isFast: (state: unknown) => unknown
  }
}

type TestStore = {
  dispatch: (action: { type: string; payload?: unknown }) => unknown
  getState: () => Record<string, unknown>
}

export function createRedux({
  eventReducers = Object.create(null),
  actionReducers = Object.create(null),
  createLogger,
  selectorDefinitions = [],
  externalSelectors,
  moduleDefinition,
}: CreateReduxParams) {
  const defaultModuleDefinition = {
    id: 'batmobile',
    type: 'redux-module',
    initialState: {},
    eventReducers,
    actionReducers,
    selectorDefinitions,
  } as const satisfies ReduxModuleDefinition

  const { reducers, initialState, createHandleEvent, selectors } = setupRedux({
    dependencies: [moduleDefinition || defaultModuleDefinition, ...(externalSelectors || [])],
    createLogger,
  })

  const store = createReduxStore({ reducers, initialState })

  return {
    store: store as TestStore,
    selectors: selectors as unknown as TestSelectors,
    handleEvent: createHandleEvent(store),
  }
}
