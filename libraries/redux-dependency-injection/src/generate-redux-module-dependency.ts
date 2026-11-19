import type { createModule } from './defaults.js'

const generateReduxModuleDependency = ({
  id,
  reducer,
  actionsDefinition,
  selectorDefinitions,
  eventReducers,
  actionReducers,
}: ReturnType<typeof createModule>) => {
  return {
    id,
    type: 'redux-module',
    factory: (...dependencies: unknown[]) => ({
      reducer,
      eventReducers,
      actionReducers,
      selectors: selectorDefinitions && dependencies.shift(),
      actions: dependencies.shift(),
    }),
    dependencies: [
      ...(selectorDefinitions ? [`${id}.selectors`] : []),
      ...(actionsDefinition ? [`${id}.actions`] : []),
    ],
  }
}

export default generateReduxModuleDependency
