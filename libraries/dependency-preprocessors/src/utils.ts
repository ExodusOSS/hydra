import { mapValues } from '@exodus/basic-utils'

export const createDependencyId = ({ id, optional }: { id: string; optional?: boolean }): string =>
  optional ? `${id}?` : id

export const namespaceLogger = ({
  logger,
  namespace,
}: {
  logger: Record<string, (...args: unknown[]) => unknown>
  namespace: string
}): Record<string, (...args: unknown[]) => unknown> => {
  return mapValues(
    logger,
    (log) =>
      (...args: unknown[]) =>
        log(`[${namespace}]`, ...args)
  )
}

const isPromise = (value: unknown): value is Promise<unknown> => {
  return Boolean(
    value && typeof value === 'object' && typeof (value as Promise<unknown>).finally === 'function'
  )
}

export const createPerformanceProxy = <T extends object>({
  object,
  now,
  threshold,
  onAboveThreshold,
}: {
  object: T
  now: () => number
  threshold: number
  onAboveThreshold: (args: { method: string | symbol; duration: number; async: boolean }) => void
}): T => {
  return new Proxy(object, {
    get(target, prop) {
      const value = Reflect.get(target, prop)
      if (typeof value !== 'function') {
        return value
      }

      return (...args: unknown[]) => {
        const start = now()
        let async = false

        const maybeNotify = () => {
          const duration = now() - start
          if (duration < threshold) return

          onAboveThreshold({ method: prop, duration, async })
        }

        try {
          const returnValue = value.apply(target, args)
          if (!isPromise(returnValue)) {
            return returnValue
          }

          async = true
          return returnValue.finally(() => {
            maybeNotify()
          })
        } finally {
          if (!async) {
            maybeNotify()
          }
        }
      }
    },
  })
}
