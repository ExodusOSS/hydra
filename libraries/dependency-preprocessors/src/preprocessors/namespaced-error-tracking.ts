import type { NodePreprocessor } from '../types.js'

type ErrorTracking = {
  track: (args: { error: unknown; context?: unknown; namespace?: unknown }) => unknown
}

const namespacedErrorTracking = (
  { errorTrackingNodeId = 'errorTracking' }: { errorTrackingNodeId?: string } = Object.create(null)
): NodePreprocessor => {
  const preprocess: NodePreprocessor['preprocess'] = (node) => {
    const { definition } = node

    const { factory: originalFactory, namespace, dependencies } = definition

    if (
      namespace === errorTrackingNodeId ||
      !Array.isArray(dependencies) ||
      !dependencies.includes(errorTrackingNodeId)
    ) {
      return node
    }

    const newFactory = (deps: Record<string, unknown>) => {
      const errorTracking = deps[errorTrackingNodeId] as ErrorTracking | undefined
      if (errorTracking !== undefined) {
        const track: ErrorTracking['track'] = ({ error, context }) => {
          return errorTracking.track({ error, context, namespace })
        }

        deps = {
          ...deps,
          [errorTrackingNodeId]: {
            track,
          },
        }
      }

      return originalFactory(deps)
    }

    return {
      ...node,
      definition: {
        ...definition,
        factory: newFactory,
      },
    }
  }

  return { type: 'node', preprocess }
}

export default namespacedErrorTracking
