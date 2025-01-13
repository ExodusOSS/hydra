import assert from 'minimalistic-assert'
import BN from 'bn.js'

// TODO: calculator delegator should wrap/unwrap all BN instances
// so that callers never gett a raw BN instance back

const FACTORY_SYMBOL = Symbol('bn-wrapper')

const unwrap = (value) => (value instanceof Wrapper ? value.unwrap() : value)

const BI_ZERO = new BN(0)

export default class Wrapper {
  static wrapperName = 'bn.js'
  static isUnderlyingInstance(a) {
    return BN.isBN(a)
  }

  static wrap(value, base = 10) {
    if (!BN.isBN(value)) {
      if (typeof value !== 'string' && typeof value !== 'number') {
        throw new TypeError(`Unsupported type: ${typeof value}`)
      }

      if (base !== 10 && base !== 16) throw new TypeError(`Unsupported base: ${base}`)

      value = new BN(value, base)
    }

    return new Wrapper(FACTORY_SYMBOL, value)
  }

  __value__

  constructor(factorySymbol, value) {
    if (factorySymbol !== FACTORY_SYMBOL) throw new Error('use wrap() instead')

    this.__value__ = value
  }

  unwrap() {
    return this.__value__
  }

  add(value) {
    return Wrapper.wrap(this.__value__.add(unwrap(value)))
  }

  mutateAdd(value) {
    this.__value__.iadd(unwrap(value))
    return this
  }

  sub(value) {
    return Wrapper.wrap(this.__value__.sub(unwrap(value)))
  }

  mutateSub(value) {
    this.__value__.isub(unwrap(value))
    return this
  }

  mul(value) {
    return Wrapper.wrap(this.__value__.mul(unwrap(value)))
  }

  mutateMul(value) {
    this.__value__.imul(unwrap(value))
    return this
  }

  div(value) {
    return Wrapper.wrap(this.__value__.div(unwrap(value)))
  }

  mutateDiv(value) {
    this.__value__.idivn(unwrap(value))
    return this
  }

  mod(value) {
    return Wrapper.wrap(this.__value__.mod(unwrap(value)))
  }

  pow(value) {
    return Wrapper.wrap(this.__value__.pow(unwrap(value)))
  }

  negate() {
    return Wrapper.wrap(this.__value__.neg())
  }

  mutateNegate() {
    return Wrapper.wrap(this.__value__.ineg())
  }

  abs() {
    return this.isNegative() ? Wrapper.wrap(this.__value__.abs()) : this
  }

  mutateAbs() {
    this.__value__.iabs()
    return this
  }

  gte(value) {
    return this.__value__.gte(unwrap(value))
  }

  gt(value) {
    return this.__value__.gt(unwrap(value))
  }

  lte(value) {
    return this.__value__.lte(unwrap(value))
  }

  lt(value) {
    return this.__value__.lt(unwrap(value))
  }

  eq(value) {
    return this.__value__.eq(unwrap(value))
  }

  isZero() {
    return this.__value__.isZero()
  }

  isNegative() {
    return this.__value__.isNeg()
  }

  isPositive() {
    return this.__value__.gt(BI_ZERO)
  }

  toNumber() {
    // false alarm, this is not a NumberUnit instance
    // eslint-disable-next-line @exodus/hydra/no-unsafe-number-unit-methods
    return this.__value__.toNumber()
  }

  toString(base) {
    assert(typeof base === 'number', 'expected number "base"')
    return this.__value__.toString(base)
  }

  toBaseBufferLE(length) {
    return this.__value__.toBuffer('le', length)
  }

  toBaseBufferBE(length) {
    return this.__value__.toBuffer('be', length)
  }

  isBigIntWrapper() {
    return true
  }
}
