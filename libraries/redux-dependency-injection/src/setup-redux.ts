import { mapKeys } from '@exodus/basic-utils'
import createIOC from '@exodus/dependency-injection'
import { createNoopLogger, type Logger } from '@exodus/logger'
import type { Definition as DependencyDefinition } from '@exodus/dependency-types'
import * as reduxLib from 'redux'
import type { Action, AnyAction, Reducer as ReduxReducerType } from 'redux'
import generateSelectorDependencies from './generate-selector-dependencies.js'
import generateReduxModuleDependency from './generate-redux-module-dependency.js'
import generateActionDependencies from './generate-action-dependencies.js'
import { createDefaultInitialState, createModule } from './defaults.js'
import eventToAction from './event-to-action.js'
import type {
  ActionsDefinition,
  ActionDictionary,
  ContainerDependency,
  ReduxReducerMap,
  ReduxModuleDefinition,
  SetupActionsParams,
  SetupReduxParams,
  SetupReduxReturn,
  SetupReduxSecondArgIfWidenedSelectorIds,
  SetupReduxState,
} from './types.js'

// redux ships CJS without statically-detectable named exports, so a bare
// `import { combineReducers }` breaks under the node:test ESM engine when a
// test mock doesn't intercept it. Read through the CJS-interop default (which
// the redux types don't model) so it resolves whether this hits real redux or
// a mocked module.
const redux = (reduxLib as unknown as { default?: typeof reduxLib }).default ?? reduxLib
const { combineReducers } = redux

type ReduxAction = Action<string> & { payload?: unknown }
type ReduxReducer = ReduxReducerType<unknown, ReduxAction>
type IOCByTypeMap = {
  'redux-actions': ActionDictionary<unknown, unknown>
  'redux-module': Record<string, ReduxModuleRuntime>
  selectors: Record<string, unknown>
}

// Internal interface — Container is not exported from @exodus/dependency-injection's public API
type IOCInstance = {
  getByType<T extends keyof IOCByTypeMap>(type: T): IOCByTypeMap[T]
  getAll(): Record<string, unknown>
}

type ReduxModuleRuntime = {
  reducer: ReduxReducer
  eventReducers?: Record<string, (state: unknown, payload: unknown) => unknown>
  eventToActionMappers?: Record<string, (payload: unknown) => ReduxAction>
}

type ReduxModuleWithExtras = ReduxModuleDefinition & {
  actionsDefinition?: ActionsDefinition
  actionReducers?: Record<string, (...args: unknown[]) => unknown>
}

type DependencyNodeDefinition = Extract<
  ContainerDependency,
  { factory: (...args: unknown[]) => unknown }
>
type ReduxModuleWithActions = ReturnType<typeof createModule> & {
  actionsDefinition: ActionsDefinition
}

const isReduxModuleDefinition = (
  dependency: ContainerDependency
): dependency is ReduxModuleWithExtras => dependency.type === 'redux-module'

const isDependencyNodeDefinition = (
  dependency: ContainerDependency
): dependency is DependencyNodeDefinition =>
  'factory' in dependency && typeof dependency.factory === 'function'

const checkReducerConflicts = ({
  baseReducers,
  reduxModuleDefinitions,
}: {
  baseReducers: ReduxReducerMap
  reduxModuleDefinitions: { id: string }[]
}) => {
  const reduxModuleIds = new Set(reduxModuleDefinitions.map(({ id }) => id))
  const conflicting = Object.keys(baseReducers).filter((key) => reduxModuleIds.has(key))
  if (conflicting.length > 0) {
    throw new Error(`refusing to overwrite reducers: ${conflicting.join(', ')}`)
  }
}

const mergeReducers = ({
  baseReducers,
  reduxModules,
}: {
  baseReducers: ReduxReducerMap
  reduxModules: Record<string, ReduxModuleRuntime>
}): ReduxReducerMap => {
  const reduxModuleReducers: ReduxReducerMap = Object.create(null)
  for (const [moduleId, { reducer }] of Object.entries(reduxModules)) {
    reduxModuleReducers[moduleId] = reducer
  }

  return { ...baseReducers, ...reduxModuleReducers }
}

const mergeActions = <Payload = unknown, Result = unknown>({
  baseActions,
  reduxModuleActions,
}: {
  baseActions: ActionDictionary<Payload, Result>
  reduxModuleActions: ActionDictionary<Payload, Result>
}) => {
  reduxModuleActions = mapKeys(reduxModuleActions, (_, key) => key.replace(/\.actions$/, ''))
  return { ...baseActions, ...reduxModuleActions }
}

const getByType = <TypeName extends keyof IOCByTypeMap>({
  ioc,
  type,
}: {
  ioc: IOCInstance
  type: TypeName
}): IOCByTypeMap[TypeName] => ioc.getByType(type)

const getReduxModuleActions = <Payload = unknown, Result = unknown>({
  ioc,
}: {
  ioc: IOCInstance
}): ActionDictionary<Payload, Result> => {
  const reduxActions = getByType({ ioc, type: 'redux-actions' })
  return reduxActions as ActionDictionary<Payload, Result>
}

const getSelectors = <SetupParams extends SetupReduxParams>({
  selectors,
}: {
  selectors: Record<string, unknown>
}): SetupReduxReturn<SetupParams>['selectors'] => {
  const unsuffixed = mapKeys(selectors, (_, key) => key.replace(/\.selectors$/, ''))
  return Object.freeze(unsuffixed) as SetupReduxReturn<SetupParams>['selectors']
}

const buildInitialState = <SetupParams extends SetupReduxParams>({
  reduxModuleDefinitions,
}: {
  reduxModuleDefinitions: { id: string; initialState?: Record<string, unknown> }[]
}): SetupReduxReturn<SetupParams>['initialState'] => {
  const merged = Object.create(null) as Record<string, unknown>
  for (const { id, initialState } of reduxModuleDefinitions) {
    merged[id] = initialState || createDefaultInitialState()
  }

  return merged as SetupReduxReturn<SetupParams>['initialState']
}

const explodeReduxModules = ({
  reduxModuleDefinitions,
  createLogger,
}: {
  reduxModuleDefinitions: ReturnType<typeof createModule>[]
  createLogger: (scope: string) => Logger
}): DependencyDefinition[] => [
  ...reduxModuleDefinitions.flatMap((definition) =>
    generateSelectorDependencies({ ...definition, createLogger })
  ),
  ...reduxModuleDefinitions
    .filter((definition): definition is ReduxModuleWithActions => !!definition.actionsDefinition)
    .map((definition) =>
      generateActionDependencies({
        id: definition.id,
        actionsDefinition: definition.actionsDefinition,
      })
    ),
  ...reduxModuleDefinitions.map(generateReduxModuleDependency),
]

const createEventHandler =
  ({
    store,
    reduxModules,
  }: {
    store: { dispatch: (action: ReduxAction) => void }
    reduxModules: Record<string, ReduxModuleRuntime>
  }) =>
  // event -> dispatched redux action(s)
  (event: string, payload: unknown) =>
    Object.entries(reduxModules).forEach(
      ([
        moduleId,
        { eventReducers = Object.create(null), eventToActionMappers = Object.create(null) },
      ]) => {
        const fn = eventReducers[event]
        if (fn) {
          store.dispatch({
            type: eventToAction({ moduleId, event }),
            payload,
          })

          return
        }

        const actionCreator = eventToActionMappers[event]
        if (actionCreator) {
          store.dispatch(actionCreator(payload))
        }
      }
    )

const setupIOC = ({
  dependencies: dependencyDefinitions,
  logger,
  createLogger,
}: {
  dependencies: ContainerDependency[]
  logger: Logger
  createLogger: (scope: string) => Logger
}) => {
  const reduxModuleDefinitions = dependencyDefinitions.filter(isReduxModuleDefinition)
  const otherDependencies = dependencyDefinitions.filter(isDependencyNodeDefinition)

  const normalizedModules = reduxModuleDefinitions.map(createModule)
  const explodedDependencies = explodeReduxModules({
    reduxModuleDefinitions: normalizedModules,
    createLogger,
  })

  const ioc = createIOC({ logger, injectDependenciesAsPositionalArguments: true }).registerMultiple(
    [...explodedDependencies, ...otherDependencies]
  )
  ioc.resolve()

  return {
    ioc,
    reduxModuleDefinitions: normalizedModules,
  }
}

export function setupActions<Payload = unknown, Result = unknown>({
  actions: baseActions = Object.create(null),
  ioc,
}: SetupActionsParams<Payload, Result>): ActionDictionary<Payload, Result> {
  return mergeActions<Payload, Result>({
    baseActions,
    reduxModuleActions: getReduxModuleActions<Payload, Result>({ ioc: ioc as IOCInstance }),
  })
}

// The rest-arg guard forces TS to surface a targeted error when any dependency
// carries a widened `id: string` on its `selectorDefinitions[]`; for well-typed
// callers the rest-arg tuple is empty and the second parameter disappears.
const setupRedux = <SetupParams extends SetupReduxParams>(
  params: SetupParams,
  ..._rejectWidenedSelectorIds: SetupReduxSecondArgIfWidenedSelectorIds<SetupParams>
): SetupReduxReturn<SetupParams> => {
  void _rejectWidenedSelectorIds

  if ('initialState' in params) {
    throw new Error(
      "setupRedux's `initialState` parameter has been removed. Move any non-module state into a redux-module's own `initialState` field."
    )
  }

  const {
    dependencies,
    reducers: baseReducers = Object.create(null),
    createLogger = createNoopLogger,
  } = params
  const logger = createLogger('exodus:redux-ioc')
  const { ioc, reduxModuleDefinitions } = setupIOC({
    dependencies,
    logger,
    createLogger,
  })
  checkReducerConflicts({ baseReducers, reduxModuleDefinitions })

  const reduxModules = getByType({ ioc, type: 'redux-module' })
  const reducers = mergeReducers({ baseReducers, reduxModules })
  const combinedReducer = combineReducers(reducers) as unknown as ReduxReducerType<
    SetupReduxState<SetupParams>,
    AnyAction
  >
  const selectors = getSelectors<SetupParams>({ selectors: getByType({ ioc, type: 'selectors' }) })
  const initialState = buildInitialState<SetupParams>({ reduxModuleDefinitions })

  const createHandleEvent = <Store extends { dispatch: (action: ReduxAction) => void }>(
    store: Store
  ) => createEventHandler({ store, reduxModules })

  return {
    initialState,
    reducers,
    combinedReducer,
    resolvedDependencies: ioc.getAll(),
    selectors,
    createHandleEvent,
    ioc,
  }
}

export default setupRedux
