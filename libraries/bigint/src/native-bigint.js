// TODO: calculator delegator should wrap/unwrap all BigInt instances
// so that callers never gett a raw BigInt instance back

import assert from 'minimalistic-assert'

const FACTORY_SYMBOL = Symbol('bigint-wrapper')

const unwrap = (value) => (value instanceof Wrapper ? value.unwrap() : value)

const BI_ZERO = BigInt(0)

export default class Wrapper {
  static wrapperName = 'native-bigint'

  static wrap(numberLike, base = 10) {
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

  static isUnderlyingInstance(value) {
    return typeof value === 'bigint'
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
    return Wrapper.wrap(this.__value__ + unwrap(value))
  }

  mutateAdd(value) {
    this.__value__ += unwrap(value)
    return this
  }

  sub(value) {
    return Wrapper.wrap(this.__value__ - unwrap(value))
  }

  mutateSub(value) {
    this.__value__ -= unwrap(value)
    return this
  }

  mul(value) {
    return Wrapper.wrap(this.__value__ * unwrap(value))
  }

  mutateMul(value) {
    this.__value__ *= unwrap(value)
    return this
  }

  div(value) {
    return Wrapper.wrap(this.__value__ / unwrap(value))
  }

  mutateDiv(value) {
    this.__value__ /= unwrap(value)
    return this
  }

  mod(value) {
    return Wrapper.wrap(this.__value__ % unwrap(value))
  }

  pow(value) {
    return Wrapper.wrap(this.__value__ ** unwrap(value))
  }

  negate() {
    return Wrapper.wrap(-this.__value__)
  }

  mutateNegate() {
    this.__value__ = -this.__value__
    return this
  }

  abs() {
    return this.__value__ < BI_ZERO ? Wrapper.wrap(-this.__value__) : this
  }

  mutateAbs() {
    if (this.__value__ < BI_ZERO) this.__value__ = -this.__value__
    return this
  }

  gte(value) {
    return this.__value__ >= unwrap(value)
  }

  gt(value) {
    return this.__value__ > unwrap(value)
  }

  lte(value) {
    return this.__value__ <= unwrap(value)
  }

  lt(value) {
    return this.__value__ < unwrap(value)
  }

  eq(value) {
    return this.__value__ === unwrap(value)
  }

  isZero() {
    return this.__value__ === BI_ZERO
  }

  isNegative() {
    return this.__value__ < BI_ZERO
  }

  isPositive() {
    return this.__value__ > BI_ZERO
  }

  toString(base) {
    assert(typeof base === 'number', 'expected number "base"')
    return this.__value__.toString(base)
  }

  toNumber() {
    return Number(this.__value__)
  }

  #getWidth() {
    const bitLength = this.__value__.toString(2).length
    return Math.ceil(bitLength / 8)
  }

  toBaseBufferLE(width = this.#getWidth()) {
    const hex = this.__value__.toString(16)
    const buffer = Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex')
    buffer.reverse()
    return buffer
  }

  toBaseBufferBE(width = this.#getWidth()) {
    const hex = this.__value__.toString(16)
    return Buffer.from(hex.padStart(width * 2, '0').slice(0, width * 2), 'hex')
  }

  isBigIntWrapper() {
    return true
  }
}
