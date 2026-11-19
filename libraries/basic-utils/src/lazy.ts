export function lazyFn<T extends (...args: any[]) => any>(fnFactory: () => T): T {
  if (typeof fnFactory !== 'function') throw new TypeError('lazyFn: expected a function')

  let fn: T | undefined
  let hasError = false
  let caughtError: unknown

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> {
    if (!fn && !hasError) {
      try {
        fn = fnFactory()
      } catch (error) {
        hasError = true
        caughtError = error
      }
    }

    // oxlint-disable-next-line no-throw-literal -- re-throws a previously caught error
    if (hasError) throw caughtError
    return fn!.call(this, ...args)
  } as T
}
