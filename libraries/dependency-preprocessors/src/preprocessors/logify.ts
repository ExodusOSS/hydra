import type { NodePreprocessor } from '../types.js'

const logify = ({
  createLogger,
}: {
  createLogger: (namespace: string) => unknown
}): NodePreprocessor => {
  const preprocess: NodePreprocessor['preprocess'] = ({ definition, ...rest }) => {
    const {
      factory,
      id = String(factory.id),
      dependencies = factory.dependencies || [],
      ...definitionRest
    } = definition

    return {
      ...rest,
      definition: {
        ...definitionRest,
        id,
        factory: (opts: Record<string, unknown>) => {
          const deps = { ...opts }

          if (deps.logger) {
            deps.logger = createLogger(`exodus:${id}`)
          }

          return factory(deps)
        },
        dependencies,
      },
    }
  }

  return { type: 'node', preprocess }
}

export default logify
