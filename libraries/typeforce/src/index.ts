import { tfJSON, TfTypeError, TfPropertyTypeError, tfSubError, getValueTypeName } from './errors.js'
import NATIVE from './native.js'
import EXTRA from './extra.js'

import type { NativeCheck } from './native.js'

type TypeForceType =
  | string
  | TypeForcePredicate
  | Record<string, unknown>
  | [TypeForceType]
  | unknown

interface TypeForcePredicate {
  (value: unknown, strict?: boolean, surrogate?: unknown): boolean
  toJSON?: () => string | unknown
}

interface ArrayOfOptions {
  minLength?: number
  maxLength?: number
  length?: number
}

const hasOwn = Function.prototype.call.bind(Object.prototype.hasOwnProperty) as (
  obj: object,
  key: string
) => boolean

const TYPES = {
  arrayOf: function arrayOf(type: TypeForceType, options?: ArrayOfOptions): TypeForcePredicate {
    const compiledType = compile(type)
    const opts = options || {}

    function _arrayOf(array: unknown, strict?: boolean): boolean {
      if (!NATIVE.Array(array)) return false
      if (NATIVE.Nil(array)) return false
      const arr = array as unknown[]
      if (opts.minLength !== undefined && arr.length < opts.minLength) return false
      if (opts.maxLength !== undefined && arr.length > opts.maxLength) return false
      if (opts.length !== undefined && arr.length !== opts.length) return false

      return arr.every(function (value: unknown, i: number) {
        try {
          return typeforce(compiledType, value, strict)
        } catch (e) {
          throw tfSubError(e, i)
        }
      })
    }

    _arrayOf.toJSON = function (): string {
      let str = '[' + tfJSON(compiledType as Parameters<typeof tfJSON>[0]) + ']'
      if (opts.length !== undefined) {
        str += '{' + opts.length + '}'
      } else if (opts.minLength !== undefined || opts.maxLength !== undefined) {
        str +=
          '{' +
          (opts.minLength === undefined ? 0 : opts.minLength) +
          ',' +
          (opts.maxLength === undefined ? Infinity : opts.maxLength) +
          '}'
      }

      return str
    }

    return _arrayOf
  },

  maybe: function maybe(type: TypeForceType): TypeForcePredicate {
    const compiledType = compile(type)

    function _maybe(value: unknown, strict?: boolean): boolean {
      return NATIVE.Nil(value) || compiledType(value, strict, maybe)
    }

    _maybe.toJSON = function (): string {
      return '?' + tfJSON(compiledType as Parameters<typeof tfJSON>[0])
    }

    return _maybe
  },

  map: function map(
    propertyType: TypeForceType,
    propertyKeyType?: TypeForceType
  ): TypeForcePredicate {
    const compiledPropertyType = compile(propertyType)
    const compiledPropertyKeyType = propertyKeyType ? compile(propertyKeyType) : undefined

    function _map(value: unknown, strict?: boolean): boolean {
      if (!NATIVE.Object(value)) return false
      if (NATIVE.Nil(value)) return false

      for (const propertyName in value as Record<string, unknown>) {
        try {
          if (compiledPropertyKeyType) {
            typeforce(compiledPropertyKeyType, propertyName, strict)
          }
        } catch (e) {
          throw tfSubError(e, propertyName, 'key')
        }

        try {
          const propertyValue = (value as Record<string, unknown>)[propertyName]
          typeforce(compiledPropertyType, propertyValue, strict)
        } catch (e) {
          throw tfSubError(e, propertyName)
        }
      }

      return true
    }

    if (compiledPropertyKeyType) {
      _map.toJSON = function (): string {
        return (
          '{' +
          tfJSON(compiledPropertyKeyType as Parameters<typeof tfJSON>[0]) +
          ': ' +
          tfJSON(compiledPropertyType as Parameters<typeof tfJSON>[0]) +
          '}'
        )
      }
    } else {
      _map.toJSON = function (): string {
        return '{' + tfJSON(compiledPropertyType as Parameters<typeof tfJSON>[0]) + '}'
      }
    }

    return _map
  },

  object: function object(uncompiled: Record<string, TypeForceType>): TypeForcePredicate {
    const type: Record<string, TypeForcePredicate> = {}

    for (const typePropertyName in uncompiled) {
      type[typePropertyName] = compile(uncompiled[typePropertyName])
    }

    function _object(value: unknown, strict?: boolean): boolean {
      if (!NATIVE.Object(value)) return false
      if (NATIVE.Nil(value)) return false

      let propertyName: string | undefined

      try {
        for (propertyName in type) {
          const propertyType = type[propertyName]!
          const propertyValue = (value as Record<string, unknown>)[propertyName]

          typeforce(propertyType, propertyValue, strict)
        }
      } catch (e) {
        throw tfSubError(e, propertyName!)
      }

      if (strict) {
        for (propertyName in value as Record<string, unknown>) {
          if (hasOwn(type, propertyName) && type[propertyName]) continue

          throw new TfPropertyTypeError(undefined, propertyName)
        }
      }

      return true
    }

    _object.toJSON = function (): string {
      return tfJSON(type as unknown as Parameters<typeof tfJSON>[0])
    }

    return _object
  },

  anyOf: function anyOf(...args: TypeForceType[]): TypeForcePredicate {
    const types = args.map(compile)

    function _anyOf(value: unknown, strict?: boolean): boolean {
      return types.some(function (type) {
        try {
          return typeforce(type, value, strict)
        } catch {
          return false
        }
      })
    }

    _anyOf.toJSON = function (): string {
      return types.map((t) => tfJSON(t as Parameters<typeof tfJSON>[0])).join('|')
    }

    return _anyOf
  },

  allOf: function allOf(...args: TypeForceType[]): TypeForcePredicate {
    const types = args.map(compile)

    function _allOf(value: unknown, strict?: boolean): boolean {
      return types.every(function (type) {
        try {
          return typeforce(type, value, strict)
        } catch {
          return false
        }
      })
    }

    _allOf.toJSON = function (): string {
      return types.map((t) => tfJSON(t as Parameters<typeof tfJSON>[0])).join(' & ')
    }

    return _allOf
  },

  quacksLike: function quacksLike(type: string): TypeForcePredicate {
    function _quacksLike(value: unknown): boolean {
      return type === getValueTypeName(value)
    }

    _quacksLike.toJSON = function (): string {
      return type
    }

    return _quacksLike
  },

  tuple: function tuple(...args: TypeForceType[]): TypeForcePredicate {
    const types = args.map(compile)

    function _tuple(values: unknown, strict?: boolean): boolean {
      if (NATIVE.Nil(values)) return false
      if (NATIVE.Nil((values as { length?: unknown }).length)) return false
      const vals = values as unknown[]
      if (strict && vals.length !== types.length) return false

      return types.every(function (type, i) {
        try {
          return typeforce(type, vals[i], strict)
        } catch (e) {
          throw tfSubError(e, i)
        }
      })
    }

    _tuple.toJSON = function (): string {
      return '(' + types.map((t) => tfJSON(t as Parameters<typeof tfJSON>[0])).join(', ') + ')'
    }

    return _tuple
  },

  value: function value(expected: unknown): TypeForcePredicate {
    function _value(actual: unknown): boolean {
      return actual === expected
    }

    _value.toJSON = function (): unknown {
      return expected
    }

    return _value
  },

  oneOf: undefined as unknown as (...args: TypeForceType[]) => TypeForcePredicate,
}

TYPES.oneOf = TYPES.anyOf

function compile(type: TypeForceType): TypeForcePredicate {
  if (NATIVE.String(type)) {
    const str = type as string
    if (str[0] === '?') return TYPES.maybe(str.slice(1))

    return (
      (NATIVE as unknown as Record<string, NativeCheck | undefined>)[str] || TYPES.quacksLike(str)
    )
  }

  if (type && NATIVE.Object(type)) {
    if (NATIVE.Array(type)) {
      const arr = type as TypeForceType[]
      if (arr.length !== 1) {
        throw new TypeError('Expected compile() parameter of type Array of length 1')
      }

      return TYPES.arrayOf(arr[0])
    }

    return TYPES.object(type as Record<string, TypeForceType>)
  }

  if (NATIVE.Function(type)) {
    return type as TypeForcePredicate
  }

  return TYPES.value(type)
}

function typeforce(
  type: TypeForceType,
  value: unknown,
  strict?: boolean,
  surrogate?: TypeForcePredicate
): true {
  if (NATIVE.Function(type)) {
    if ((type as TypeForcePredicate)(value, strict)) return true

    throw new TfTypeError(surrogate || type, value)
  }

  return typeforce(compile(type), value, strict)
}

const tf = typeforce as unknown as Record<string, unknown>

for (const typeName in NATIVE) {
  tf[typeName] = (NATIVE as unknown as Record<string, unknown>)[typeName]
}

for (const typeName in TYPES) {
  tf[typeName] = (TYPES as unknown as Record<string, unknown>)[typeName]
}

for (const typeName in EXTRA) {
  tf[typeName] = EXTRA[typeName]
}

tf.compile = compile
tf.parse = <T = unknown>(
  type: TypeForceType,
  value: T,
  strict?: boolean,
  surrogate?: TypeForcePredicate
): T => {
  if (strict === false) throw new Error('parse() is always strict')
  if (typeforce(type, value, true, surrogate)) return value

  throw new Error('failed to parse')
}

tf.TfTypeError = TfTypeError
tf.TfPropertyTypeError = TfPropertyTypeError

interface Typeforce {
  (type: TypeForceType, value: unknown, strict?: boolean, surrogate?: TypeForcePredicate): true
  compile: typeof compile
  parse: <T = unknown>(
    type: TypeForceType,
    value: T,
    strict?: boolean,
    surrogate?: TypeForcePredicate
  ) => T
  TfTypeError: typeof TfTypeError
  TfPropertyTypeError: typeof TfPropertyTypeError
  Array: NativeCheck
  Boolean: NativeCheck
  Function: NativeCheck
  Nil: NativeCheck
  Null: NativeCheck
  Number: NativeCheck
  Object: NativeCheck
  String: NativeCheck
  arrayOf: typeof TYPES.arrayOf
  maybe: typeof TYPES.maybe
  map: typeof TYPES.map
  object: typeof TYPES.object
  anyOf: typeof TYPES.anyOf
  oneOf: typeof TYPES.anyOf
  allOf: typeof TYPES.allOf
  quacksLike: typeof TYPES.quacksLike
  tuple: typeof TYPES.tuple
  value: typeof TYPES.value
  ArrayN: (length: number) => TypeForcePredicate
  Buffer: TypeForcePredicate
  BufferN: (length: number) => TypeForcePredicate
  Finite: TypeForcePredicate
  Hex: TypeForcePredicate
  HexN: (length: number) => TypeForcePredicate
  Int8: TypeForcePredicate
  Int16: TypeForcePredicate
  Int32: TypeForcePredicate
  Int53: TypeForcePredicate
  Range: (a: number, b: number, f?: NativeCheck) => TypeForcePredicate
  StringN: (length: number) => TypeForcePredicate
  UInt8: TypeForcePredicate
  UInt16: TypeForcePredicate
  UInt32: TypeForcePredicate
  UInt53: TypeForcePredicate
}

export = typeforce as unknown as Typeforce
