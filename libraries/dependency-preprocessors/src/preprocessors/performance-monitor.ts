import { createPerformanceProxy } from '../utils.js'
import type { NodePreprocessor } from '../types.js'

type PerformanceMonitorOptions = {
  now?: () => number
  onAboveThreshold?: (args: {
    method: string | symbol
    duration: number
    async: boolean
    id: string
  }) => void
  config?: {
    enabled?: boolean
    threshold?: number
  }
}

const performanceMonitor = ({
  now = () => (typeof performance === 'undefined' ? Date.now() : performance.now()),
  onAboveThreshold = () => {},
  config: { threshold = 50 } = Object.create(null),
}: PerformanceMonitorOptions): NodePreprocessor => {
  const preprocess: NodePreprocessor['preprocess'] = (node) => {
    const { definition, ...rest } = node
    const { id } = definition

    const wrapped = {
      ...definition,
      factory: (deps: Record<string, unknown>) => {
        const instance = definition.factory(deps)
        if (typeof instance !== 'object' || instance === null) return instance

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
