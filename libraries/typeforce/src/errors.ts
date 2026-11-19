import native from './native.js'

import type { NativeCheck } from './native.js'

type TypeLike = NativeCheck | string | Record<string, unknown> | unknown[] | undefined

function getTypeName(fn: { name?: string; toString(): string }): string {
  return fn.name || fn.toString().match(/function ([^\s(]*)\s*\(/u)![1]!
}

export function getValueTypeName(value: unknown): string {
  return native.Nil(value)
    ? ''
    : getTypeName((value as { constructor: { name: string } }).constructor)
}

function getValue(value: unknown): string | unknown {
  if (native.Function(value)) return ''
  if (native.String(value)) return JSON.stringify(value)
  if (value && native.Object(value)) return ''
  return value
}

function captureStackTrace(e: Error, _t?: unknown): void {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(e, _t as (...args: unknown[]) => unknown)
  }
}

export function tfJSON(type: TypeLike): string {
  if (native.Function(type)) {
    return (type as NativeCheck).toJSON
      ? (type as NativeCheck).toJSON()
      : getTypeName(type as { name?: string; toString(): string })
  }

  if (native.Array(type)) return 'Array'
  if (type && native.Object(type)) return 'Object'

  return type === undefined ? '' : (type as string)
}

function tfErrorString(type: TypeLike, value: unknown, valueTypeName: string): string {
  const valueJson = getValue(value)

  return (
    'Expected ' +
    tfJSON(type) +
    ', got' +
    (valueTypeName === '' ? '' : ' ' + valueTypeName) +
    (valueJson === '' ? '' : ' ' + valueJson)
  )
}

export class TfTypeError extends Error {
  __type: unknown
  __value: unknown
  __valueTypeName: string

  constructor(type: unknown, value?: unknown, valueTypeName?: string) {
    valueTypeName = valueTypeName || getValueTypeName(value)
    super(tfErrorString(type as TypeLike, value, valueTypeName))

    this.__type = type
    this.__value = value
    this.__valueTypeName = valueTypeName
  }
}

function tfPropertyErrorString(
  type: TypeLike,
  label: string | undefined,
  name: string | number,
  value: unknown,
  valueTypeName: string
): string {
  let description = '" of type '
  if (label === 'key') description = '" with key type '

  return tfErrorString(
    'property "' + tfJSON(name as unknown as TypeLike) + description + tfJSON(type),
    value,
    valueTypeName
  )
}

export class TfPropertyTypeError extends Error {
  __label: string | undefined

  __property: string | number
  __type: unknown
  __value: unknown
  __valueTypeName: string | undefined

  constructor(
    type: unknown,
    property: string | number,
    label?: string,
    value?: unknown,
    valueTypeName?: string
  ) {
    let message: string
    if (type) {
      valueTypeName = valueTypeName || getValueTypeName(value)
      message = tfPropertyErrorString(type as TypeLike, label, property, value, valueTypeName)
    } else {
      message = 'Unexpected property "' + property + '"'
    }

    super(message)
    this.__label = label
    this.__property = property
    this.__type = type
    this.__value = value
    this.__valueTypeName = valueTypeName
  }
}

export function tfCustomError(expected: string, actual: string): TfTypeError {
  return new TfTypeError(expected, {}, actual)
}

export function tfSubError(e: unknown, property: string | number, label?: string): Error {
  if (e instanceof TfPropertyTypeError) {
    property = property + '.' + e.__property

    e = new TfPropertyTypeError(e.__type, property, e.__label, e.__value, e.__valueTypeName)
  } else if (e instanceof TfTypeError) {
    e = new TfPropertyTypeError(e.__type, property, label, e.__value, e.__valueTypeName)
  }

  captureStackTrace(e as Error)
  return e as Error
}
