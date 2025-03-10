import type { Frame } from './types.js'

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

export default function parseStackTraceNatively(err: Error): Frame[] | undefined {
  const { prepareStackTrace } = Error

  let stack: Frame[] | undefined
  let calledOn: Error
  Error.prepareStackTrace = (e, callSites) => {
    calledOn = e
    stack = callSites.map((trace) => ({
      function: trace.getFunctionName(),
      method: trace.getMethodName(),
      file: trace.getFileName(),
      line: trace.getLineNumber(),
      column: trace.getColumnNumber(),
      // see https://v8.dev/docs/stack-trace-api
      async: (trace as any).isAsync?.(),
      toplevel: trace.isToplevel(),
    }))
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    err.stack // trigger prepareStackTrace
  } finally {
    Error.prepareStackTrace = prepareStackTrace
  }

  // @ts-expect-error calledOn gets assigned in prepareStackTrace
  if (calledOn === err && Array.isArray(stack)) return stack
}
