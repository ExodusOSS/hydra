const namespacedErrorTracking = (
  { errorTrackingNodeId = 'errorTracking' } = Object.create(null)
) => {
  const preprocess = (node) => {
    const { definition } = node

    const { factory: originalFactory, namespace, dependencies } = definition

    if (
      namespace === errorTrackingNodeId ||
      !Array.isArray(dependencies) ||
      !dependencies.includes(errorTrackingNodeId)
    ) {
      return node
    }

    const newFactory = (deps) => {
      const errorTracking = deps[errorTrackingNodeId]
      if (errorTracking !== undefined) {
        const track = ({ error, context }) => errorTracking.track({ error, context, namespace })
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
