import namespacedErrorTracking from '../src/preprocessors/namespaced-error-tracking.js'

describe('namespaced error-tracking preprocessor unit tests', () => {
  const fakeErrorTracking = {
    track: ({ error, context, namespace }) => ({ error, context, namespace }),
  }
  it("should inject node's namespace to track function of errorTracking module", () => {
    const nodeDefinition = {
      id: 'testNode',
      type: 'node',
      factory: ({ errorTracking }) => {
        return {
          func: () => errorTracking.track({ error: 'error1', context: {} }),
        }
      },
      dependencies: ['errorTracking'],
      namespace: 'test',
    }
    const { definition } = namespacedErrorTracking({
      errorTrackingNodeId: 'errorTracking',
    }).preprocess({
      definition: nodeDefinition,
    })
    const node = definition.factory({ errorTracking: fakeErrorTracking })
    const result = node.func()
    expect(result.namespace).toBe('test')
  })

  it('should not be applied inside the error tracking feature', () => {
    const node = {
      definition: {
        id: 'errorTrackingApi',
        type: 'api',
        factory: ({ errorTracking }) => errorTracking.track({ error: 'error1', context: {} }),
        dependencies: ['errorTracking'],
        namespace: 'errorTracking',
      },
    }

    const { definition } = namespacedErrorTracking({
      errorTrackingNodeId: 'errorTracking',
    }).preprocess(node)

    const result = definition.factory({ errorTracking: fakeErrorTracking })
    expect(result.namespace).toBeUndefined()
  })

  it("should be fine if the node doesn't have errorTracking as a dependency", () => {
    const nodeDefinition = {
      id: 'testNode',
      type: 'node',
      factory: ({ config }) => config,
      dependencies: ['config'],
      namespace: 'test',
    }
    const { definition } = namespacedErrorTracking().preprocess({
      definition: nodeDefinition,
    })
    const result = definition.factory({ config: { check: 'value' } })

    expect(result.check).toBe('value')
  })
})
