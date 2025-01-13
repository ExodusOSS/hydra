import { intersection, mapKeys, mapValues, partition } from '@exodus/basic-utils'
import createIOC from '@exodus/dependency-injection'
import { createNoopLogger } from '@exodus/logger'
import generateSelectorDependencies from './generate-selector-dependencies.js'
import generateReduxModuleDependency from './generate-redux-module-dependency.js'
import generateActionDependencies from './generate-action-dependencies.js'
import { createDefaultInitialState, createModule } from './defaults.js'
import eventToAction from './event-to-action.js'

const checkConflicts = ({ baseInitialState, baseReducers, reduxModuleDefinitions }) => {
  const reduxModuleIds = reduxModuleDefinitions.map(({ id }) => id)
  const conflictingInitialStateIds = intersection(reduxModuleIds, Object.keys(baseInitialState))
  if (conflictingInitialStateIds.length > 0) {
    throw new Error(`refusing to overwrite initialState: ${conflictingInitialStateIds.join(', ')}`)
  }

  const conflictingIds = intersection(reduxModuleIds, Object.keys(baseReducers))
  if (conflictingIds.length > 0) {
    throw new Error(`refusing to overwrite reducers: ${conflictingIds.join(', ')}`)
  }
}

const mergeReducers = ({ baseReducers, reduxModules }) => {
  const reduxModuleReducers = mapValues(reduxModules, ({ reducer }) => reducer)
  return { ...baseReducers, ...reduxModuleReducers }
}

const mergeActions = ({ baseActions, reduxModuleActions }) => {
  reduxModuleActions = mapKeys(reduxModuleActions, (_, key) => key.replace(/\.actions$/, ''))
  return { ...baseActions, ...reduxModuleActions }
}

const getSelectors = ({ selectors }) => {
  const unsuffixed = mapKeys(selectors, (_, key) => key.replace(/\.selectors$/, ''))
  return Object.freeze(unsuffixed)
}

const mergeInitialState = ({ baseInitialState, reduxModuleDefinitions }) =>
  reduxModuleDefinitions.reduce(
    (mergedInitialState, { id, initialState }) => {
      mergedInitialState[id] = initialState || createDefaultInitialState()
      return mergedInitialState
    },
    { ...baseInitialState }
  )

const explodeReduxModules = ({ reduxModuleDefinitions, createLogger }) => [
  ...reduxModuleDefinitions.flatMap((definition) =>
    generateSelectorDependencies({ ...definition, createLogger })
  ),
  ...reduxModuleDefinitions
    .filter(({ actionsDefinition }) => !!actionsDefinition)
    .map(generateActionDependencies),
  ...reduxModuleDefinitions.map(generateReduxModuleDependency),
]

const createEventHandler =
  ({ store, reduxModules, logger }) =>
  // event -> dispatched redux action(s)
  (event, payload) =>
    Object.entries(reduxModules).forEach(
      ([
        moduleId,
        { eventReducers = Object.create(null), eventToActionMappers = Object.create(null) },
      ]) => {
        const fn = eventReducers[event]
        if (fn) {
          logger.debug(`mapped event "${event}" to an action`)
          store.dispatch({
            type: eventToAction({ moduleId, event }),
            payload,
          })

          return
        }

        const actionCreator = eventToActionMappers[event]
        if (actionCreator) {
          logger.debug(`mapped event "${event}" to an action`)
          store.dispatch(actionCreator(payload))
        }
      }
    )

const setupIOC = ({ dependencies: dependencyDefinitions, logger, createLogger }) => {
  const ioc = createIOC({ logger, injectDependenciesAsPositionalArguments: true })
  let [reduxModuleDefinitions, otherDependencies] = partition(
    dependencyDefinitions,
    ({ type }) => type === 'redux-module'
  )

  reduxModuleDefinitions = reduxModuleDefinitions.map(createModule)

  const explodedDependencies = explodeReduxModules({ reduxModuleDefinitions, createLogger })
  ioc.registerMultiple([...explodedDependencies, ...otherDependencies])
  ioc.resolve()

  return {
    ioc,
    reduxModuleDefinitions,
  }
}

export const setupActions = ({ actions: baseActions = Object.create(null), ioc }) => {
  return mergeActions({ baseActions, reduxModuleActions: ioc.getByType('redux-actions') })
}

const setupRedux = ({
  dependencies,
  initialState: baseInitialState = Object.create(null),
  reducers: baseReducers = Object.create(null),
  createLogger = createNoopLogger,
}) => {
  const logger = createLogger('exodus:redux-ioc')
  const { ioc, reduxModuleDefinitions } = setupIOC({
    dependencies,
    logger,
    createLogger,
  })
  checkConflicts({ baseInitialState, baseReducers, reduxModuleDefinitions })

  const reduxModules = ioc.getByType('redux-module')
  const reducers = mergeReducers({ baseReducers, reduxModules })
  const selectors = getSelectors({ selectors: ioc.getByType('selectors') })
  const initialState = mergeInitialState({ baseInitialState, reduxModuleDefinitions })

  const createHandleEvent = (store) => createEventHandler({ store, reduxModules, logger })

  return {
    initialState,
    reducers,
    resolvedDependencies: ioc.getAll(),
    selectors,
    createHandleEvent,
    ioc,
  }
}

export default setupRedux
