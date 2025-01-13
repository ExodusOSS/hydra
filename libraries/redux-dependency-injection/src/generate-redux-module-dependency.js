const generateReduxModuleDependency = ({
  id,
  initialState,
  reducer,
  actionsDefinition,
  selectorDefinitions,
  eventReducers,
  actionReducers,
  ...rest
}) => {
  return {
    ...rest,
    id,
    factory: (...dependencies) => ({
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
