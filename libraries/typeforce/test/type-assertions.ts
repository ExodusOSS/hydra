/* oxlint-disable no-unused-vars */
import typeforce from '../src/index.js'

type AssertEqual<T, U> = [T] extends [U] ? ([U] extends [T] ? true : never) : never
const assert = <T extends true>() => {}

assert<AssertEqual<ReturnType<typeof typeforce>, true>>()

assert<AssertEqual<typeof typeforce.Array, (value: unknown, ...args: unknown[]) => boolean>>()
assert<AssertEqual<typeof typeforce.Boolean, (value: unknown, ...args: unknown[]) => boolean>>()
assert<AssertEqual<typeof typeforce.Nil, (value: unknown, ...args: unknown[]) => boolean>>()

assert<
  AssertEqual<
    ReturnType<typeof typeforce.compile>,
    (value: unknown, strict?: boolean, surrogate?: unknown) => boolean
  >
>()

const parsed: string = typeforce.parse('String', 'hello')
assert<AssertEqual<typeof parsed, string>>()

const _TfTypeError: new (type: unknown, value?: unknown, valueTypeName?: string) => Error =
  typeforce.TfTypeError
const _TfPropertyTypeError: new (
  type: unknown,
  property: string | number,
  label?: string,
  value?: unknown,
  valueTypeName?: string
) => Error = typeforce.TfPropertyTypeError

assert<AssertEqual<ReturnType<typeof typeforce.arrayOf>, typeof typeforce.Array>>()
assert<AssertEqual<ReturnType<typeof typeforce.maybe>, typeof typeforce.Array>>()
assert<AssertEqual<ReturnType<typeof typeforce.oneOf>, typeof typeforce.Array>>()
assert<AssertEqual<ReturnType<typeof typeforce.allOf>, typeof typeforce.Array>>()
assert<AssertEqual<ReturnType<typeof typeforce.map>, typeof typeforce.Array>>()
assert<AssertEqual<ReturnType<typeof typeforce.object>, typeof typeforce.Array>>()
assert<AssertEqual<ReturnType<typeof typeforce.tuple>, typeof typeforce.Array>>()
assert<AssertEqual<ReturnType<typeof typeforce.quacksLike>, typeof typeforce.Array>>()

assert<AssertEqual<ReturnType<typeof typeforce.ArrayN>, typeof typeforce.Array>>()
assert<AssertEqual<ReturnType<typeof typeforce.BufferN>, typeof typeforce.Array>>()
assert<AssertEqual<ReturnType<typeof typeforce.HexN>, typeof typeforce.Array>>()
assert<AssertEqual<ReturnType<typeof typeforce.StringN>, typeof typeforce.Array>>()
assert<AssertEqual<ReturnType<typeof typeforce.Range>, typeof typeforce.Array>>()

assert<AssertEqual<typeof typeforce.Buffer, typeof typeforce.Array>>()
assert<AssertEqual<typeof typeforce.Hex, typeof typeforce.Array>>()
assert<AssertEqual<typeof typeforce.Finite, typeof typeforce.Array>>()
assert<AssertEqual<typeof typeforce.Int8, typeof typeforce.Array>>()
assert<AssertEqual<typeof typeforce.UInt8, typeof typeforce.Array>>()
assert<AssertEqual<typeof typeforce.Int53, typeof typeforce.Array>>()
assert<AssertEqual<typeof typeforce.UInt53, typeof typeforce.Array>>()
