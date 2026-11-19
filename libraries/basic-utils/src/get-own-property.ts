type TypeofString =
  | 'string'
  | 'number'
  | 'boolean'
  | 'symbol'
  | 'undefined'
  | 'object'
  | 'function'
  | 'bigint'

type TypeofMap = {
  string: string
  number: number
  boolean: boolean
  symbol: symbol
  undefined: undefined
  object: object | null
  // oxlint-disable-next-line typescript/no-unsafe-function-type
  function: Function
  bigint: bigint
}

/**
 * Audit friendly way to get object[key].
 */
// Overload for typed objects - returns the actual property type
export function getOwnProperty<T extends object, K extends keyof T>(
  object: T,
  key: K
): T[K] | undefined

// Overload with expected type validation
export function getOwnProperty<T extends TypeofString>(
  object: unknown,
  key: PropertyKey,
  expectedType: T
): TypeofMap[T] | undefined

// Overload for unknown objects without type validation
export function getOwnProperty(object: unknown, key: PropertyKey): unknown

export function getOwnProperty(
  object: unknown,
  key: PropertyKey,
  expectedType?: TypeofString
): unknown {
  const value =
    object && typeof object === 'object' && Object.prototype.hasOwnProperty.call(object, key)
      ? (object as Record<PropertyKey, unknown>)[key]
      : undefined

  // eslint-disable-next-line valid-typeof
  if (value !== undefined && expectedType !== undefined && typeof value !== expectedType) {
    throw new TypeError(
      `Unexpected type for key ${String(key)}, expected ${expectedType} but got ${typeof value}`
    )
  }

  return value
}
