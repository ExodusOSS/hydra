import _isNumberUnit from './is-number-unit.js'
import conversionByRate from './conversion-by-rate.js'
import deprecationWarning, { maybeReportDifferentTypesDeprecated } from './deprecation-warning.js'
import isUnitType from './is-unit-type.js'
import BigIntWrapper from '@exodus/bigint'
import { createNumber, stringToNumberFraction } from './number-unit-utils.js'

const TEN = BigIntWrapper.wrap(10)

export default class NumberUnit {
  static create(num, unit) {
    return new NumberUnit(num, unit)
  }

  // so you don't have to do instanceof and get bit by different included versions
  static isNumberUnit = _isNumberUnit

  // prop types
  _number
  unit
  unitType
  baseUnit
  defaultUnit
  unitName

  constructor(numberLike, unit) {
    // assert(unit instanceof Unit, 'Must specify type of Unit.')

    // @deprecated
    this.unit = unit

    // TODO: make these getters
    this.unitType = unit.unitType
    this.baseUnit = unit.unitType.baseUnit
    this.defaultUnit = unit.unitType.defaultUnit
    this.unitName = this.unit.unitName // deprecated

    this._number = createNumber(numberLike, unit.power)
    Object.defineProperty(this, '_numberStringMap', {
      enumerable: false,
      value: new Map(),
      writable: true,
    })
  }

  abs() {
    return new NumberUnit(this._number.abs(), this.unit)
  }

  add(num) {
    num = this._coerceToNumberUnit(num)
    maybeReportDifferentTypesDeprecated(this, num, 'add')

    if (num.isZero) return this
    if (this.isZero) return new NumberUnit(num._number, this.unit)
    return new NumberUnit(this._number.add(num._number), this.unit)
  }

  clampLowerZero() {
    const zero = new NumberUnit(0, this.unit)
    if (this.gte(zero)) return this
    return zero
  }

  clone() {
    return new NumberUnit(this._number, this.unit)
  }

  equals(num) {
    maybeReportDifferentTypesDeprecated(this, num, 'equals')
    return this._number.eq(num._number)
  }

  gt(num) {
    maybeReportDifferentTypesDeprecated(this, num, 'gt')
    return this._number.gt(num._number)
  }

  gte(num) {
    maybeReportDifferentTypesDeprecated(this, num, 'gte')
    return this._number.gte(num._number)
  }

  /*
  inspect() {
    return `<NumberUnit: ${this.toString()} >`
  }
  */

  lt(num) {
    maybeReportDifferentTypesDeprecated(this, num, 'lt')
    return this._number.lt(num._number)
  }

  lte(num) {
    maybeReportDifferentTypesDeprecated(this, num, 'lte')
    return this._number.lte(num._number)
  }

  mul(num) {
    if (NumberUnit.isNumberUnit(num)) {
      throw new TypeError(`NumberUnit.mul does not support NumberUnit as argument.`)
    }

    if (BigIntWrapper.isUnderlyingInstance(num)) {
      num = BigIntWrapper.wrap(num)
    }

    if (num.isBigIntWrapper?.()) {
      return new NumberUnit(this._number.mul(num), this.unit)
    }

    const { number, fraction, fractionLength } = stringToNumberFraction(num, 0)

    const result =
      number !== '0' && number !== '-0'
        ? this._number.mul(BigIntWrapper.wrap(number))
        : BigIntWrapper.wrap(0)

    if (fraction !== '0' && fraction !== '-0') {
      const fractionBN = BigIntWrapper.wrap(fraction)
        .mutateMul(this._number)
        .div(TEN.pow(BigIntWrapper.wrap(fractionLength)))
      result.mutateAdd(fractionBN)
    }

    return new NumberUnit(result, this.unit)
  }

  div(num) {
    if (NumberUnit.isNumberUnit(num)) {
      throw new TypeError(`NumberUnit.div does not support NumberUnit as argument.`)
    }

    if (BigIntWrapper.isUnderlyingInstance(num)) {
      return new NumberUnit(this._number.div(num), this.unit)
    }

    const { number, fraction, fractionLength } = stringToNumberFraction(num, 0)

    // 10 / 1.52 => * 100 => 1000 / (100 + 52)
    const fractionPow = TEN.pow(BigIntWrapper.wrap(fractionLength))
    const divisor = BigIntWrapper.wrap(number)
      .mutateMul(fractionPow)
      .mutateAdd(BigIntWrapper.wrap(fraction))

    if (divisor.isZero()) throw new Error('Invalid division by 0')

    const bn = this._number.mul(fractionPow).div(divisor)

    return new NumberUnit(bn, this.unit)
  }

  floor() {
    if (this.unit.power === 0) {
      // TODO: deprecate this usage
      return this
    }

    const num = this._toNumberString()
    const [whole] = num.split('.')
    return new NumberUnit(whole, this.unit)
  }

  round() {
    if (this.unit.power === 0) {
      // TODO: deprecate this usage
      return this
    }

    const num = this._toNumberString()
    const [whole, fraction] = num.split('.')
    let newNumber = new NumberUnit(whole, this.unit)

    if (fraction && Math.round(Number.parseFloat(`0.${fraction}`)) > 0) {
      newNumber = newNumber.add(new NumberUnit(1, this.unit))
    }

    return newNumber
  }

  ceil() {
    if (this.unit.power === 0) {
      // TODO: deprecate this usage
      return this
    }

    const num = this._toNumberString()
    const [whole, fraction] = num.split('.')
    let newNumber = new NumberUnit(whole, this.unit)

    if (fraction && Math.ceil(Number.parseFloat(`0.${fraction}`)) > 0) {
      newNumber = newNumber.add(new NumberUnit(1, this.unit))
    }

    return newNumber
  }

  // @deprecated
  toFixed(x, rm) {
    const factor = BigIntWrapper.wrap(10).pow(BigIntWrapper.wrap(x))
    let num = new NumberUnit(this._number.mul(factor), this.unit)
    switch (rm) {
      case 'floor':
        num = num.floor()
        break
      case 'ceil':
        num = num.ceil()
        break
      default:
        num = num.round()
    }

    num = new NumberUnit(num._number.div(factor), this.unit)
    return num
  }

  negate() {
    return new NumberUnit(this._number.negate(), this.unit)
  }

  sub(num) {
    num = this._coerceToNumberUnit(num)
    maybeReportDifferentTypesDeprecated(this, num, 'sub')

    if (num.isZero) return this
    if (this.isZero) return new NumberUnit(num._number.negate(), this.unit)
    return new NumberUnit(this._number.sub(num._number), this.unit)
  }

  // always returns NumberUnit in base unit for consistency and ease of operation
  // this.unit will be deprecated/removed, at which point the above will be irrelevant
  // when casting to a UnitType with lower power we truncate the remaining decimals (not round)
  cast(unitType) {
    if (!isUnitType(unitType)) throw new Error('unitType needs to be a UnitType instance')
    if (this.unitType.equals(unitType)) return this.toBase()

    const unit = unitType.baseUnit
    let number = this._number
    const thisPower = this.unitType.defaultUnit.power
    const otherPower = unitType.defaultUnit.power

    if (number.isZero() || thisPower === otherPower) return new NumberUnit(number, unit)

    const multiplier = TEN.pow(BigIntWrapper.wrap(Math.abs(otherPower - thisPower), 10))

    if (thisPower < otherPower) {
      number = number.mul(multiplier)
    } else if (thisPower > otherPower) {
      number = number.div(multiplier)
    }

    return new NumberUnit(number, unit)
  }

  // @deprecated
  toBase() {
    // already is base
    if (this.unit.power === 0) {
      return this
    }

    return new NumberUnit(this._number, this.baseUnit)
  }

  // @deprecated
  toDefault() {
    if (this.defaultUnit === this.unit) return this
    return this.to(this.defaultUnit)
  }

  // @deprecated
  to(unit, conversionUnit) {
    if (unit === this.unit) return this
    // e.g. 'bits'
    if (typeof unit === 'string') {
      unit = this.unitType.units[unit]
    }

    if (this.unit.unitType.equals(unit.unitType)) {
      // same unitType e.g. BTC to satoshis
      return new NumberUnit(this._number, unit)
    }

    if (!conversionUnit) throw new Error('Incompatible unit types. Must specify a conversion.')

    // deprecated
    if (typeof conversionUnit === 'function') {
      // new way
      return conversionUnit(this)
    }

    if (!this.unitType.equals(conversionUnit.from.unitType)) {
      throw new Error('Conversion unit from is of different type.')
    }

    const rate =
      Number.parseFloat(conversionUnit.toValue) / Number.parseFloat(conversionUnit.fromValue)
    const convert = conversionByRate(
      conversionUnit.from.unitType,
      conversionUnit.to.unitType,
      rate,
      { unit1: conversionUnit.fromUnit, unit2: conversionUnit.toUnit }
    )
    return convert(this)
  }

  // this is only here to prevent JSON stringify circular error
  // you should probably use toString() in conjunction with parse()
  // a corresponding fromJSON probably won't ever be implemented
  toJSON() {
    return {
      value: this._toNumberString(),
      unit: this.unitName,
      unitType: this.unitType.toString(),
      type: 'NumberUnit',
    }
  }

  toNumber(unit) {
    return Number.parseFloat(this._toNumberString(unit))
  }

  toDefaultNumber() {
    return this.toNumber(this.defaultUnit)
  }

  toBaseNumber() {
    return this.toNumber(this.baseUnit)
  }

  toBaseBufferLE(length) {
    return this._number.toBaseBufferLE(length)
  }

  toBaseBufferBE(length) {
    return this._number.toBaseBufferBE(length)
  }

  toNumberString(unit) {
    deprecationWarning(
      'DEPRECATION WARNING: number-unit.toNumberString usage will be removed soon. Use number-unit.toString({unit: false}) instead'
    )

    return this._toNumberString(unit)
  }

  _toNumberString(unit = this.unit) {
    const noInstanceWarning =
      'WARNING: number-unit was cloned improperly and is no longer a NumberUnit instance'
    const unitString = unit.toString()
    if (this._numberStringMap && this._numberStringMap.get(unitString)) {
      return this._numberStringMap.get(unitString)
    }

    if (!this._numberStringMap) {
      deprecationWarning(noInstanceWarning)
    }

    let numberUnit
    if (unit === this.unit) numberUnit = this // eslint-disable-line unicorn/no-this-assignment
    else numberUnit = this.to(unit)

    // FIXME: we should either
    // - stop accessing the private underlying `_number` instance
    // - make it public
    // - export a toRoundedNumberString() method
    let number = numberUnit._number.toString(10)
    if (numberUnit.unit.power === 0) {
      if (this._numberStringMap) this._numberStringMap.set(unitString, number)
      else deprecationWarning(noInstanceWarning)

      return number
    }

    // strip minus sign
    const isNeg = number[0] === '-'
    if (isNeg) {
      number = number.slice(1)
    }

    // insert decimal point
    if (number.length < numberUnit.unit.power + 1) {
      number = number.padStart(numberUnit.unit.power + 1, '0')
    }

    number = number.slice(0, -numberUnit.unit.power) + '.' + number.slice(-numberUnit.unit.power)

    // remove extra zeros
    const pp = number.indexOf('.')
    if (pp !== -1) {
      let zp = number.length - 1
      while (number[zp] === '0' && zp > pp) zp -= 1

      // cut tail zeros
      if (zp !== number.length - 1) {
        // strip point if no symbols after it
        if (number[zp] === '.') zp--

        number = number.slice(0, zp + 1)
      }
    }

    // add the minus sign
    if (isNeg) {
      number = '-' + number
    }

    if (this._numberStringMap) this._numberStringMap.set(unitString, number)
    else deprecationWarning(noInstanceWarning)
    return number
  }

  // TODO: `format` is undocumented, consider if passing `this._number` is correct. Probably should just pass `this`
  toString({ unit = true, format, unitInstance = this.unit } = {}) {
    if (unitInstance) {
      unitInstance = this.unitType.units[unitInstance.toString()]
    }

    if (format) {
      // passing toNumberString here to maintain compatibility with previous versions
      return format(this._toNumberString(unitInstance), unitInstance)
    }

    return this._toNumberString(unitInstance) + (unit ? ' ' + unitInstance.unitName : '')
  }

  toDefaultString({ unit = false } = {}) {
    return this.toString({ unitInstance: this.defaultUnit, unit })
  }

  toBaseString({ unit = false } = {}) {
    return this.toString({ unitInstance: this.baseUnit, unit })
  }

  // @deprecated
  valueOf() {
    return this.toDefaultNumber()
  }

  // NOTE: for debugging, should probably use Chrome Formatter:
  // https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U/preview
  get value() {
    return this.toString()
  }

  get isNegative() {
    return this._number.isNegative()
  }

  get isPositive() {
    // NOTE: zero is not considered to be a positive number
    return this._number.isPositive()
  }

  get isZero() {
    return this._number.isZero()
  }

  // convert 'number' / 'string' to NumberUnit
  _coerceToNumberUnit(number) {
    // force cast for flow
    if (NumberUnit.isNumberUnit(number)) return number

    deprecationWarning(
      'DEPRECATION WARNING: number-unit.add/sub usage with int or string param will be removed soon'
    )

    return new NumberUnit(number, this.unit)
  }
}
