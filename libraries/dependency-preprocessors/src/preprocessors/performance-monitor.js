import { createPerformanceProxy } from '../utils.js'

const performanceMonitor = ({
  now = performance.now.bind(performance),
  onAboveThreshold,
  config: { threshold = 50 } = {},
}) => {
  const preprocess = (node) => {
    const { definition, ...rest } = node
    const { id } = definition

    const wrapped = {
      ...definition,
      factory: (deps) => {
        const instance = definition.factory(deps)
        if (typeof instance !== 'object') return instance

        return createPerformanceProxy({
          object: instance,
          now,
          onAboveThreshold: (args) => onAboveThreshold({ ...args, id }),
          threshold,
        })
      },
    }

    return {
      ...rest,
      definition: wrapped,
    }
  }

  return { type: 'node', preprocess }
}

export default performanceMonitor
