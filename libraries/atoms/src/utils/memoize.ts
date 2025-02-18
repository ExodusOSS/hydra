import { memoize } from '@exodus/basic-utils'

export type ModelLike = Record<string, any> & { toJSON: () => object }

function processValue(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value !== 'object') {
    const isSpecialType = ['symbol', 'function', 'bigint'].includes(typeof value)
    // eslint-disable-next-line sonarjs/no-base-to-string
    return isSpecialType ? value.toString() : value
  }

  if (seen.has(value)) {
    return '[Circular]'
  }

  seen.add(value)

  if (isModelWithToJSON(value)) {
    return value.toJSON()
  }

  if (value instanceof RegExp) {
    return value.toString()
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value instanceof Map) {
    return [...value.entries()].map(([k, v]) => [k, processValue(v, seen)])
  }

  if (value instanceof Set) {
    return [...value].map((v) => processValue(v, seen))
  }

  if (Array.isArray(value)) {
    return value.map((v) => processValue(v, seen))
  }

  // Handle plain objects
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value)) {
    if (val !== undefined) {
      result[key] = processValue(val, seen)
    }
  }

  return result
}

function safeSerialize(value: unknown): string {
  try {
    return JSON.stringify(processValue(value, new WeakSet()))
  } catch {
    console.error('Could not serialize value:', value)
    throw new Error('Value could not be serialized for memoization')
  }
}

function isModelWithToJSON(value: unknown): value is ModelLike {
  return (
    typeof value === 'object' &&
    value !== null &&
    'toJSON' in value &&
    typeof (value as ModelLike).toJSON === 'function'
  )
}

export function safeMemoize<T extends (...args: any[]) => any>(fn: T): T {
  return memoize(fn, safeSerialize)
}
