// TODO: calculator delegator should wrap/unwrap all BigInt instances
// so that callers never gett a raw BigInt instance back

import assert from 'minimalistic-assert'

const FACTORY_SYMBOL = Symbol('bigint-wrapper')
const BigIntWrapperIdSymbol = Symbol.for('Exodus:BigIntWrapperId')

type Numeric = Wrapper | bigint

const unwrap = (value: Numeric): bigint => (value instanceof Wrapper ? value.unwrap() : value)

const BI_ZERO = BigInt(0)

export default class Wrapper {
  static wrapperName = 'native-bigint'

  static get [BigIntWrapperIdSymbol](): string {
    return 'BigIntWrapper'
  }

  static [Symbol.hasInstance](instance: unknown): boolean {
    const candidate = instance as
      | { constructor?: { [BigIntWrapperIdSymbol]?: unknown } }
      | null
      | undefined
    if (!candidate?.constructor || Object.hasOwn(candidate, 'constructor')) {
      return false
    }

    // This is the same as `instance instanceof this`, but it avoids triggering
    // the custom `hasInstance` implementation, preventing infinite recursion.
    if (Function.prototype[Symbol.hasInstance].call(this, instance)) {
      return true
    }

    // Cross-copy fallback: match only when both classes directly declare the
    // brand (not via inheritance), so subclasses don't cross-match their base.
    return (
      Object.hasOwn(this, BigIntWrapperIdSymbol) &&
      Object.hasOwn(candidate.constructor, BigIntWrapperIdSymbol) &&
      this[BigIntWrapperIdSymbol] === candidate.constructor[BigIntWrapperIdSymbol]
    )
  }

  static wrap(numberLike: bigint | number | string, base: 10 | 16 = 10): Wrapper {
    if (typeof numberLike === 'bigint') return new Wrapper(FACTORY_SYMBOL, numberLike)
    if (typeof numberLike === 'number') return new Wrapper(FACTORY_SYMBOL, BigInt(numberLike))
    if (typeof numberLike !== 'string') throw new Error(`Unsupported type: ${typeof numberLike}`)

    switch (base) {
      case 10:
        return new Wrapper(FACTORY_SYMBOL, BigInt(numberLike))
      case 16:
        return new Wrapper(FACTORY_SYMBOL, BigInt('0x' + numberLike))
      default:
        throw new Error(`Unsupported base: ${base}`)
    }
  }

  static isUnderlyingInstance(value: unknown): value is bigint {
    return typeof value === 'bigint'
  }

  __value__: bigint

  constructor(factorySymbol: symbol, value: bigint) {
    if (factorySymbol !== FACTORY_SYMBOL) throw new Error('use wrap() instead')
    this.__value__ = value
  }

  unwrap(): bigint {
    return this.__value__
  }

  add(value: Numeric): Wrapper {
    return Wrapper.wrap(this.__value__ + unwrap(value))
  }

  mutateAdd(value: Numeric): this {
    this.__value__ += unwrap(value)
    return this
  }

  sub(value: Numeric): Wrapper {
    return Wrapper.wrap(this.__value__ - unwrap(value))
  }

  mutateSub(value: Numeric): this {
    this.__value__ -= unwrap(value)
    return this
  }

  mul(value: Numeric): Wrapper {
    return Wrapper.wrap(this.__value__ * unwrap(value))
  }

  mutateMul(value: Numeric): this {
    this.__value__ *= unwrap(value)
    return this
  }

  div(value: Numeric): Wrapper {
    return Wrapper.wrap(this.__value__ / unwrap(value))
  }

  mutateDiv(value: Numeric): this {
    this.__value__ /= unwrap(value)
    return this
  }

  mod(value: Numeric): Wrapper {
    return Wrapper.wrap(this.__value__ % unwrap(value))
  }

  pow(value: Numeric): Wrapper {
    return Wrapper.wrap(this.__value__ ** unwrap(value))
  }

  negate(): Wrapper {
    return Wrapper.wrap(-this.__value__)
  }

  mutateNegate(): this {
    this.__value__ = -this.__value__
    return this
  }

  abs(): Wrapper {
    return Wrapper.wrap(this.__value__ < BI_ZERO ? -this.__value__ : this.__value__)
  }

  mutateAbs(): this {
    if (this.__value__ < BI_ZERO) this.__value__ = -this.__value__
    return this
  }

  gte(value: Numeric): boolean {
    return this.__value__ >= unwrap(value)
  }

  gt(value: Numeric): boolean {
    return this.__value__ > unwrap(value)
  }

  lte(value: Numeric): boolean {
    return this.__value__ <= unwrap(value)
  }

  lt(value: Numeric): boolean {
    return this.__value__ < unwrap(value)
  }

  eq(value: Numeric): boolean {
    return this.__value__ === unwrap(value)
  }

  isZero(): boolean {
    return this.__value__ === BI_ZERO
  }

  isNegative(): boolean {
    return this.__value__ < BI_ZERO
  }

  isPositive(): boolean {
    return this.__value__ > BI_ZERO
  }

  toString(base: number): string {
    assert(typeof base === 'number', 'expected number "base"')
    return this.__value__.toString(base)
  }

  toNumber(): number {
    return Number(this.__value__)
  }

  #getWidth(): number {
    const bitLength = this.__value__.toString(2).length
    return Math.ceil(bitLength / 8)
  }

  toBaseBufferLE(width: number = this.#getWidth()): Buffer {
    const hex = this.__value__.toString(16)
    const buffer = Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex')
    buffer.reverse()
    return buffer
  }

  toBaseBufferBE(width: number = this.#getWidth()): Buffer {
    const hex = this.__value__.toString(16)
    return Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex')
  }

  isBigIntWrapper(): boolean {
    return true
  }
}
