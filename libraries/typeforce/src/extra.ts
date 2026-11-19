import NATIVE from './native.js'
import { tfCustomError } from './errors.js'

import type { NativeCheck } from './native.js'

interface TypeCheckFn {
  (value: unknown, ...args: unknown[]): boolean
  toJSON: () => string
}

function _Buffer(value: unknown): boolean {
  return Buffer.isBuffer(value)
}

function Hex(value: unknown): boolean {
  return typeof value === 'string' && /^([\da-f]{2})+$/iu.test(value)
}

function _LengthN(type: NativeCheck | TypeCheckFn, length: number): TypeCheckFn {
  const name = type.toJSON()

  function Length(value: unknown): boolean {
    if (!type(value)) return false
    if ((value as { length: number }).length === length) return true

    throw tfCustomError(
      name + '(Length: ' + length + ')',
      name + '(Length: ' + (value as { length: number }).length + ')'
    )
  }

  Length.toJSON = function (): string {
    return name
  }

  return Length
}

const _ArrayN = _LengthN.bind(null, NATIVE.Array)
const _BufferN = _LengthN.bind(null, _Buffer as unknown as NativeCheck)
const _HexN = _LengthN.bind(null, Hex as unknown as NativeCheck)
const _StringN = _LengthN.bind(null, NATIVE.String)

function Range(a: number, b: number, f?: NativeCheck): TypeCheckFn {
  const check = f || NATIVE.Number

  function _range(value: unknown, ...args: unknown[]): boolean {
    return check(value, ...args) && (value as number) > a && (value as number) < b
  }

  _range.toJSON = function (): string {
    return `${check.toJSON()} between [${a}, ${b}]`
  }

  return _range
}

const INT53_MAX = Math.pow(2, 53) - 1

function Finite(value: unknown): boolean {
  return typeof value === 'number' && isFinite(value)
}

function Int8(value: unknown): boolean {
  return ((value as number) << 24) >> 24 === value
}

function Int16(value: unknown): boolean {
  return ((value as number) << 16) >> 16 === value
}

function Int32(value: unknown): boolean {
  return ((value as number) | 0) === value // oxlint-disable-line unicorn/prefer-math-trunc
}

function Int53(value: unknown): boolean {
  return (
    typeof value === 'number' &&
    value >= -INT53_MAX &&
    value <= INT53_MAX &&
    Math.floor(value) === value
  )
}

function UInt8(value: unknown): boolean {
  return ((value as number) & 0xff) === value
}

function UInt16(value: unknown): boolean {
  return ((value as number) & 0xff_ff) === value
}

function UInt32(value: unknown): boolean {
  return (value as number) >>> 0 === value
}

function UInt53(value: unknown): boolean {
  return (
    typeof value === 'number' && value >= 0 && value <= INT53_MAX && Math.floor(value) === value
  )
}

const types: Record<string, ((...args: unknown[]) => unknown) & { toJSON?: () => string }> = {
  ArrayN: _ArrayN as unknown as TypeCheckFn,
  Buffer: _Buffer as unknown as TypeCheckFn,
  BufferN: _BufferN as unknown as TypeCheckFn,
  Finite: Finite as unknown as TypeCheckFn,
  Hex: Hex as unknown as TypeCheckFn,
  HexN: _HexN as unknown as TypeCheckFn,
  Int8: Int8 as unknown as TypeCheckFn,
  Int16: Int16 as unknown as TypeCheckFn,
  Int32: Int32 as unknown as TypeCheckFn,
  Int53: Int53 as unknown as TypeCheckFn,
  Range: Range as unknown as TypeCheckFn,
  StringN: _StringN as unknown as TypeCheckFn,
  UInt8: UInt8 as unknown as TypeCheckFn,
  UInt16: UInt16 as unknown as TypeCheckFn,
  UInt32: UInt32 as unknown as TypeCheckFn,
  UInt53: UInt53 as unknown as TypeCheckFn,
}

for (const typeName in types) {
  types[typeName]!.toJSON = function (t: string) {
    return t
  }.bind(null, typeName)
}

export default types
