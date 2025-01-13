import { mapValues } from '@exodus/basic-utils'

export const createDependencyId = ({ id, optional }) => (optional ? `${id}?` : id)

export const namespaceLogger = ({ logger, namespace }) =>
  mapValues(
    logger,
    (log) =>
      (...args) =>
        log(`[${namespace}]`, ...args)
  )

const isPromise = (object) =>
  object && typeof object === 'object' && typeof object.finally === 'function'

export const createPerformanceProxy = ({ object, now, threshold, onAboveThreshold }) => {
  return new Proxy(object, {
    get(target, prop, receiver) {
      const value = target[prop]
      if (typeof value !== 'function') {
        return value
      }

      return (...args) => {
        const start = now()
        let async = false

        const maybeNotify = () => {
          const end = now()
          const duration = end - start
          if (duration < threshold) return

          onAboveThreshold({ method: prop, duration, async })
        }

        try {
          const returnValue = target[prop](...args)

          if (!isPromise(returnValue)) {
            return returnValue
          }

          async = true
          return returnValue.finally(() => maybeNotify())
        } finally {
          if (!async) {
            maybeNotify()
          }
        }
      }
    },
  })
}
