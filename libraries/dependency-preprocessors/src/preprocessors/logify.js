const logify = ({ createLogger }) => {
  const preprocess = ({ definition, ...rest }) => {
    const {
      factory,
      id = factory.id,
      dependencies = factory.dependencies || [],
      ...definitionRest
    } = definition

    return {
      ...rest,
      definition: {
        ...definitionRest,
        id,
        factory: (opts) => {
          const deps = { ...opts }

          if (deps.logger) deps.logger = createLogger(`exodus:${id}`)

          return factory(deps)
        },
        dependencies,
      },
    }
  }

  return { type: 'node', preprocess }
}

export default logify
