const validateConfigType = ({ id, config }) => {
  if (config === null || (config !== undefined && typeof config !== 'object')) {
    throw new TypeError(
      `expected "config" for "${id}" to be an object, got: ${
        config == null ? config : typeof config
      }`
    )
  }
}

const config = () => {
  const preprocess = ({ definition, config: configAlongsideDefinition, ...rest }) => {
    const {
      factory,
      id = factory.id,
      dependencies = factory.dependencies || [],
      ...definitionRest
    } = definition

    const configRegex = /^config\??$/
    if (configAlongsideDefinition) {
      if (!dependencies.some((it) => configRegex.test(it))) {
        throw new Error(`"config" specified on node but not as dependency of definition of "${id}"`)
      }

      validateConfigType({ id, config: configAlongsideDefinition })
    }

    const needsConfig = dependencies.includes('config')
    return {
      ...rest,
      definition: {
        ...definitionRest,
        id,
        factory: (opts) => {
          const deps = { ...opts }

          const configFromConfigDependency = deps.config?.[id]
          validateConfigType({ id, configFromConfigDependency })

          if (configAlongsideDefinition || configFromConfigDependency) {
            deps.config = { ...configAlongsideDefinition, ...configFromConfigDependency }
            return factory(deps)
          }

          if (needsConfig) {
            throw new Error(`expected "config" for "${id}"`)
          }

          delete deps.config
          return factory(deps)
        },
        dependencies,
      },
    }
  }

  return {
    type: 'node',
    preprocess,
  }
}

export default config
