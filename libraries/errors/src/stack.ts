import type { Frame } from './types.js'

const stackCache = new WeakMap<Error, Frame[] | undefined>()

export function captureStackTrace(err: Error): void {
  if (stackCache.has(err)) {
    return
  }

  const { prepareStackTrace: originalPrepareStackTrace } = Error

  let structuredStack: Frame[] | undefined

  let calledOn: Error
  Error.prepareStackTrace = (err, callSites) => {
    calledOn = err
    structuredStack = callSites.map((trace) => ({
      function: trace.getFunctionName(),
      method: trace.getMethodName(),
      file: trace.getFileName(),
      line: trace.getLineNumber(),
      column: trace.getColumnNumber(),
      // see https://v8.dev/docs/stack-trace-api
      async: (trace as any).isAsync?.(),
      toplevel: trace.isToplevel(),
    }))

    // Let V8 continue to build the default `.stack` string
    if (originalPrepareStackTrace) return originalPrepareStackTrace(err, callSites)

    // Non V8 case (e.g. Hermes).
    return err.stack
  }

  try {
    // do NOT add "void", it will remove the whole line in a tragic transpilation accident
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    err.stack // trigger prepareStackTrace
  } finally {
    Error.prepareStackTrace = originalPrepareStackTrace
  }

  // @ts-expect-error calledOn gets assigned in prepareStackTrace
  if (calledOn === err && Array.isArray(structuredStack)) {
    stackCache.set(err, structuredStack)
  } else {
    // This helps to avoid calling `captureStackTrace` multiple times on the same error.
    stackCache.set(err, undefined)
  }
}

export function stackFramesToString(frames?: Frame[]): string | undefined {
  if (frames === undefined) {
    return
  }

  return frames
    .map((frame) => {
      const { function: fn, file, line, column } = frame
      return `    at ${fn || 'unknownFn'}${file ? ` (${file}${line === null ? '' : `:${line}:${column}`})` : ''}`
    })
    .join('\n')
}

/**
 * If this function returns undefined, that likely means `error.stack` has been already accessed.
 * Consider calling `captureStackTrace` first to capture the customized stack trace, e.g.,
 *
 * ```ts
 * captureStackTrace(error)
 * console.log(error.stack)
 * ...
 * const safeError = SafeError.from(error) // Works even if `error.stack` has been accessed.
 * ```
 */
export default function parseStackTraceNatively(err: Error): Frame[] | undefined {
  if (stackCache.has(err)) {
    return stackCache.get(err)
  }

  captureStackTrace(err)

  return stackCache.get(err)
}
