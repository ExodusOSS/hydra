import type { Setter } from './types.js'

export function isSetter<T>(value: T | Setter<T>): value is Setter<T> {
  return typeof value === 'function'
}
