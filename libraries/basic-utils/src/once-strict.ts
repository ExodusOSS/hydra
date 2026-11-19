export function onceStrict<T extends (...args: any[]) => any>(func: T): T {
  if (typeof func !== 'function') {
    throw new TypeError(`onceStrict: expected a function, got ${typeof func}`)
  }

  let fn: T | undefined = func
  let result: ReturnType<T>
  let hasError = false
  let caughtError: unknown
  let isCalling = false

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): ReturnType<T> {
    if (isCalling) throw new Error('onceStrict: re-entrant call detected')

    if (fn) {
      isCalling = true
      try {
        result = fn.apply(this, args)
      } catch (error) {
        hasError = true
        caughtError = error
      } finally {
        fn = undefined
        isCalling = false
      }
    }

    // oxlint-disable-next-line no-throw-literal -- re-throws a previously caught error
    if (hasError) throw caughtError

    return result
  } as T
}
