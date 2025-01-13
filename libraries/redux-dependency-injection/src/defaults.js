import { difference, mapKeys } from '@exodus/basic-utils'
import { MY_STATE } from './constants.js'
import eventToAction from './event-to-action.js'

export const createDefaultInitialState = () => ({
  error: null,
  loaded: false,
  data: Object.create(null),
})

export const createModule = ({
  id: moduleId,
  initialState = createDefaultInitialState(),
  actionsDefinition,
  eventReducers = Object.create(null),
  actionReducers = Object.create(null),
  selectorDefinitions = [],
}) => {
  const actions = mapKeys(eventReducers, (_, event) => eventToAction({ moduleId, event }))
  const reducer = (state = initialState, { type, payload }) =>
    actions[type]?.(state, payload) ?? actionReducers[type]?.(state, payload) ?? state

  return {
    id: moduleId,
    type: 'redux-module',
    initialState,
    reducer,
    eventReducers,
    actionsDefinition,
    // one selector for each declared `initialState` field
    selectorDefinitions: [
      ...selectorDefinitions,
      ...difference(
        Object.keys(initialState),
        selectorDefinitions.map(({ id }) => id)
      ).map((key) => ({
        id: key,
        type: 'selector',
        dependencies: [{ selector: MY_STATE }],
        resultFunction: (selfState) => selfState[key] ?? initialState[key],
      })),
    ],
  }
}
