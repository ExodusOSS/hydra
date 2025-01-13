const createUiConfigApiDefinition = ({ configValues }) => {
  const atomIds = configValues.map((v) => v.atomId)

  return {
    definition: {
      type: 'api',
      id: 'uiConfig',
      factory: ({ ...atoms }) => {
        const uiConfig = configValues.reduce((acc, { id, atomId }) => {
          acc[id] = { get: atoms[atomId].get, set: atoms[atomId].set }
          return acc
        }, {})

        return { uiConfig }
      },
      dependencies: atomIds,
      public: true,
    },
  }
}

export default createUiConfigApiDefinition
