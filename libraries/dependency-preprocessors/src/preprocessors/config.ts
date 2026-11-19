import type { DependencyNode, NodePreprocessor } from '../types.js'

type ConfigNode = DependencyNode & {
  config?: unknown
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object'
}

const validateConfigType = ({ id, config }: { id: string; config: unknown }) => {
  if (!isObject(config) && config !== undefined) {
    throw new TypeError(
      `expected "config" for "${id}" to be an object, got: ${
        config == null ? config : typeof config
      }`
    )
  }
}

const config = (): NodePreprocessor => {
  const preprocess: NodePreprocessor['preprocess'] = (node) => {
    const { definition, config: configAlongsideDefinition, ...rest } = node as ConfigNode
    const {
      factory,
      id = String(factory.id),
      dependencies = factory.dependencies || [],
      ...definitionRest
    } = definition

    const configRegex = /^config\??$/u
    if (configAlongsideDefinition) {
      if (!dependencies.some((dependencyId) => configRegex.test(dependencyId))) {
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
        factory: (opts: Record<string, unknown>) => {
          const deps = { ...opts }

          const configDependency = deps.config as Record<string, unknown> | undefined
          const configFromConfigDependency = configDependency?.[id]
          validateConfigType({ id, config: configFromConfigDependency })

          if (configAlongsideDefinition || configFromConfigDependency) {
            deps.config = {
              ...(isObject(configAlongsideDefinition)
                ? configAlongsideDefinition
                : Object.create(null)),
              ...(isObject(configFromConfigDependency)
                ? configFromConfigDependency
                : Object.create(null)),
            }
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
