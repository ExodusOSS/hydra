// NOT at_flow
// for some reason flow keeps throwing: "Cannot resolve module bn.js."
import BN from 'bn.js'
import _isNumberUnit from './is-number-unit'
import { Unit } from './unit'
import UnitType from './unit-type'
import conversionByRate from './conversion-by-rate'
import deprecationWarning, { maybeReportDifferentTypesDeprecated } from './deprecation-warning'

export type NumberLike = string | number | BN
type toNumberUnitType = string | Unit | Object | UnitType

export default class NumberUnit {
  static create(num: NumberLike, unit: Unit) {
    return new NumberUnit(num, unit)
  }

  // so you don't have to do instanceof and get bit by different included versions
  static isNumberUnit = _isNumberUnit

  // prop types
  _number: BN
  unit: Unit
  unitType: UnitType
  baseUnit: Unit
  defaultUnit: Unit
  unitName: string

  constructor(num: NumberLike, unit: Unit) {
    // assert(unit instanceof Unit, 'Must specify type of Unit.')

    // deprecated
    this.unit = unit

    // TODO: make these getters
    this.unitType = unit.unitType
    this.baseUnit = unit.unitType.baseUnit
    this.defaultUnit = unit.unitType.defaultUnit
    this.unitName = this.unit.unitName // deprecated

    this._number = this._createNumber(num)
    Object.defineProperty(this, '_numberStringMap', {
      enumerable: false,
      value: new Map(),
      writable: true,
    })
  }

  _createNumber(num: NumberLike): BN {
    if (BN.isBN(num)) {
      return num
    }

    const number = this._stringToNumberFraction(num, this.unit.power, { numberOnly: true })
    return new BN(number, 10)
  }

  _stringToNumberFraction(
    num: string | number,
    exp: number,
    { numberOnly = false } = {}
  ): { number: string, fraction: string, fractionLength: number } | number {
    if (typeof num === 'number') {
      if (num === Infinity || num === -Infinity) throw new Error('Infinity is not supported')
      num = num.toString()
    } else num = num.toLowerCase()

    // 0x means hex number, can be only positive without fraction?
    if (num.length > 2 && num[0] === '0' && num[1] === 'x') {
      // need validate, because BN do not have it
      num = num.slice(2)
      if (!/^[0-9.a-f]*$/.test(num)) {
        throw new Error(`Invalid hex number: 0x${num}`)
      }

      num = new BN(num, 16).toString(10)
    }

    // create negative flag and remove symbol from num
    const isNeg = num[0] === '-'
    if (isNeg) {
      num = num.slice(1)
    }
    const firstSymbol = isNeg ? '-' : ''

    // remove extra plus symbol (-+ not allowed)
    if (num[0] === '+' && !isNeg) {
      num = num.slice(1)
    }

    // remove exponential from num and adjust exp
    const ep = num.indexOf('e')
    if (ep !== -1) {
      exp += parseInt(num.slice(ep + 1), 10)
      if (Number.isNaN(exp)) {
        throw new Error(`Invalid exponential in number: ${num}`)
      }

      num = num.slice(0, ep)
    }

    // verify that there no extra symbols, only `0-9` and one `.` allowed
    if (!/^\d*(\.\d*)?$/.test(num)) {
      throw new Error(`Not allowed symbol in number: ${num}`)
    }

    // add point in case if num do not have it
    // add extra zero if first or last symbol is a point
    const pp = num.indexOf('.')
    if (pp === -1) {
      num += '.0'
    } else if (pp === 0) {
      num = '0' + num
    } else if (pp === num.length - 1) {
      num += '0'
    }

    if (exp === 0) {
      const npp = num.indexOf('.')

      const number = firstSymbol + num.slice(0, npp)
      if (numberOnly) return number

      const fraction = num.slice(npp + 1)
      return { number, fraction: firstSymbol + fraction, fractionLength: fraction.length }
    }

    // add extra zeros
    if (exp > 0) {
      num = num.padEnd(num.length + exp, '0')
    } else {
      num = num.padStart(num.length - exp, '0')
    }

    // cut point symbol
    const npp = num.indexOf('.')
    num = num.slice(0, npp) + num.slice(npp + 1)

    const number = firstSymbol + num.slice(0, npp + exp)
    if (numberOnly) return number

    let fraction = num.slice(npp + exp)
    let zp = fraction.length - 1
    while (fraction[zp] === '0' && zp > 0) zp -= 1
    // cut tail zeros
    if (zp !== fraction.length - 1) {
      fraction = fraction.slice(0, zp + 1)
    }

    return { number: number, fraction: firstSymbol + fraction, fractionLength: fraction.length }
  }

  abs(): NumberUnit {
    return new NumberUnit(this._number.abs(), this.unit)
  }

  add(num: NumberLike | NumberUnit): NumberUnit {
    num = this._coerceToNumberUnit(num)
    maybeReportDifferentTypesDeprecated(this, num, 'add')

    if (num.isZero) return this
    else if (this.isZero) return new NumberUnit(num._number, this.unit)
    return new NumberUnit(this._number.add(num._number), this.unit)
  }

  clampLowerZero(): NumberUnit {
    const zero = new NumberUnit(0, this.unit)
    if (this.gte(zero)) return this
    else return zero
  }

  clone(): NumberUnit {
    return new NumberUnit(this._number, this.unit)
  }

  equals(num: NumberUnit): boolean {
    maybeReportDifferentTypesDeprecated(this, num, 'equals')
    return this._number.eq(num._number)
  }

  gt(num: NumberUnit): boolean {
    maybeReportDifferentTypesDeprecated(this, num, 'gt')
    return this._number.gt(num._number)
  }

  gte(num: NumberUnit): boolean {
    maybeReportDifferentTypesDeprecated(this, num, 'gte')
    return this._number.gte(num._number)
  }

  /*
  inspect(): string {
    return `<NumberUnit: ${this.toString()} >`
  }
  */

  lt(num: NumberUnit): boolean {
    maybeReportDifferentTypesDeprecated(this, num, 'lt')
    return this._number.lt(num._number)
  }

  lte(num: NumberUnit): boolean {
    maybeReportDifferentTypesDeprecated(this, num, 'lte')
    return this._number.lte(num._number)
  }

  mul(num: NumberLike): NumberUnit {
    if (BN.isBN(num)) {
      return new NumberUnit(this._number.mul(num), this.unit)
    }

    if (NumberUnit.isNumberUnit(num)) maybeReportDifferentTypesDeprecated(this, num, 'mul')

    const { number, fraction, fractionLength } = this._stringToNumberFraction(num, 0)

    const bn = new BN(0, 10)

    if (number !== '0' && number !== '-0') {
      this._number.mulTo(new BN(number, 10), bn)
    }

    if (fraction !== '0' && fraction !== '-0') {
      const fractionBN = new BN(fraction, 10)
        .imul(this._number)
        .div(new BN(10, 10).pow(new BN(fractionLength, 10)))
      bn.iadd(fractionBN)
    }

    return new NumberUnit(bn, this.unit)
  }

  div(num: NumberLike): NumberUnit {
    if (BN.isBN(num)) {
      return new NumberUnit(this._number.div(num), this.unit)
    }

    if (NumberUnit.isNumberUnit(num)) maybeReportDifferentTypesDeprecated(this, num, 'div')

    const { number, fraction, fractionLength } = this._stringToNumberFraction(num, 0)

    // 10 / 1.52 => * 100 => 1000 / (100 + 52)
    const fractionPow = new BN(10, 10).pow(new BN(fractionLength, 10))
    const numberBN = new BN(number, 10).imul(fractionPow).iadd(new BN(fraction, 10))

    if (numberBN.isZero()) throw new Error('Invalid division by 0')

    const bn = this._number.mul(fractionPow).div(numberBN)

    return new NumberUnit(bn, this.unit)
  }

  floor() {
    if (this.unit.power === 0) {
      return this
    } else {
      const num = this._toNumberString()
      const [whole] = num.split('.')
      return new NumberUnit(whole, this.unit)
    }
  }

  round() {
    if (this.unit.power === 0) {
      return this
    } else {
      const num = this._toNumberString()
      const [whole, fraction] = num.split('.')
      let newNumber = new NumberUnit(whole, this.unit)

      if (fraction && Math.round(parseFloat(`0.${fraction}`)) > 0) {
        newNumber = newNumber.add(new NumberUnit(1, this.unit))
      }

      return newNumber
    }
  }

  ceil() {
    if (this.unit.power === 0) {
      return this
    } else {
      const num = this._toNumberString()
      const [whole, fraction] = num.split('.')
      let newNumber = new NumberUnit(whole, this.unit)

      if (fraction && Math.ceil(parseFloat(`0.${fraction}`)) > 0) {
        newNumber = newNumber.add(new NumberUnit(1, this.unit))
      }

      return newNumber
    }
  }

  // TODO: deprecate
  toFixed(x: number, rm: string): NumberUnit {
    const factor = new BN(10, 10).pow(new BN(x, 10))
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

  negate(): NumberUnit {
    return new NumberUnit(this._number.neg(), this.unit)
  }

  sub(num: NumberLike | NumberUnit): NumberUnit {
    num = this._coerceToNumberUnit(num)
    maybeReportDifferentTypesDeprecated(this, num, 'sub')

    if (num.isZero) return this
    else if (this.isZero) return new NumberUnit(num._number.neg(), this.unit)
    return new NumberUnit(this._number.sub(num._number), this.unit)
  }

  // always returns NumberUnit in base unit for consistency and ease of operation
  // this.unit will be deprecated/removed, at which point the above will be irrelevant
  // when casting to a UnitType with lower power we truncate the remaining decimals (not round)
  cast(unitType: UnitType): NumberUnit {
    if (!(unitType instanceof UnitType)) throw new Error('unitType needs to be a UnitType instance')
    if (this.unitType.equals(unitType)) return this.toBase()

    const unit: Unit = unitType.baseUnit
    let number: BN = this._number
    if (number.isZero()) return new NumberUnit(number, unit)

    const thisPower = this.unitType.defaultUnit.power
    const otherPower = unitType.defaultUnit.power
    if (thisPower < otherPower) {
      number = new BN(number.toString() + '0'.repeat(otherPower - thisPower), 10)
    } else if (thisPower > otherPower) {
      const powerDiff = thisPower - otherPower
      const numberString = number.toString()
      const numberDigits = number.isNeg() ? numberString.length - 1 : numberString.length
      if (powerDiff >= numberDigits) return new NumberUnit(new BN('0', 10), unit)

      number = new BN(numberString.substring(0, numberString.length - powerDiff), 10)
    }

    return new NumberUnit(number, unit)
  }

  // `to` deprecated
  toBase(): NumberUnit {
    // already is base
    if (this.unit.power === 0) {
      return this
    }

    return new NumberUnit(this._number, this.baseUnit)
  }

  // `to` deprecated
  toDefault(): NumberUnit {
    if (this.defaultUnit === this.unit) return this
    return this.to(this.defaultUnit)
  }

  // `to` deprecated
  // with 'conversionUnit' usage is deprecated
  to(unit: toNumberUnitType, conversionUnit?: any): NumberUnit {
    if (unit === this.unit) return this
    // e.g. 'bits'
    if (typeof unit === 'string') {
      unit = this.unitType.units[unit]
    }

    if (!(this.unit: Unit).unitType.equals((unit: Unit).unitType)) {
      if (!conversionUnit) throw new Error('Incompatible unit types. Must specify a conversion.')

      // deprecated
      if (typeof conversionUnit !== 'function') {
        if (!this.unitType.equals(conversionUnit.from.unitType)) {
          throw new Error('Conversion unit from is of different type.')
        }

        const rate = parseFloat(conversionUnit.toValue) / parseFloat(conversionUnit.fromValue)
        const convert = conversionByRate(
          conversionUnit.from.unitType,
          conversionUnit.to.unitType,
          rate,
          { unit1: conversionUnit.fromUnit, unit2: conversionUnit.toUnit }
        )
        return convert(this)
      } else {
        // new way
        return conversionUnit(this)
      }
    } else {
      // same unitType e.g. BTC to satoshis
      return new NumberUnit(this._number, (unit: Unit))
    }
  }

  // this is only here to prevent JSON stringify circular error
  // you should probably use toString() in conjunction with parse()
  // a corresponding fromJSON probably won't ever be implemented
  toJSON(): Object {
    return {
      value: this._toNumberString(),
      unit: this.unitName,
      unitType: this.unitType.toString(),
      type: 'NumberUnit',
    }
  }

  toNumber(unit: ?toNumberUnitType): number {
    return parseFloat(this._toNumberString(unit))
  }

  toDefaultNumber(): number {
    return this.toNumber(this.defaultUnit)
  }

  toBaseNumber(): number {
    return this.toNumber(this.baseUnit)
  }

  toBaseBufferLE(): Buffer {
    return this.toBase()._number.toBuffer('le')
  }

  toBaseBufferBE(): Buffer {
    return this.toBase()._number.toBuffer('be')
  }

  toNumberString(unit: ?toNumberUnitType): string {
    deprecationWarning(
      'DEPRECATION WARNING: number-unit.toNumberString usage will be removed soon. Use number-unit.toString({unit: false}) instead'
    )

    return this._toNumberString(unit)
  }

  _toNumberString(unit: ?toNumberUnitType = this.unit): string {
    const noInstanceWarning =
      'WARNING: number-unit was cloned improperly and is no longer a NumberUnit instance'
    const unitString = unit.toString()
    if (this._numberStringMap && this._numberStringMap.get(unitString)) {
      return this._numberStringMap.get(unitString)
    } else if (!this._numberStringMap) {
      deprecationWarning(noInstanceWarning)
    }

    let numberUnit
    if (unit === this.unit) numberUnit = this
    else numberUnit = this.to(unit)

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
  toString({
    unit = true,
    format,
    unitInstance = this.unit,
  }: { unit?: boolean, format?: (num: BN, unit: Unit) => string } = {}) {
    if (!format) {
      return this._toNumberString(unitInstance) + (unit ? ' ' + unitInstance.unitName : '')
    } else {
      // passing toNumberString here to maintain compatibility with previous versions
      return format(this._toNumberString(unitInstance), unitInstance)
    }
  }

  toDefaultString({ unit = false } = {}): string {
    return this.toString({ unitInstance: this.defaultUnit, unit })
  }

  toBaseString({ unit = false } = {}): string {
    return this.toString({ unitInstance: this.baseUnit, unit })
  }

  // TODO: consider returning base unit
  valueOf(): number {
    return this.toDefault().toNumber()
  }

  // NOTE: for debugging, should probably use Chrome Formatter:
  // https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U/preview
  get value(): string {
    return this.toString()
  }

  get isNegative(): boolean {
    return this._number.isNeg()
  }

  get isPositive(): boolean {
    // NOTE: zero is not considered to be a positive number
    return this._number.gt(new BN(0))
  }

  get isZero(): boolean {
    return this._number.isZero()
  }

  // convert 'number' / 'string' to NumberUnit
  _coerceToNumberUnit(number: NumberLike | NumberUnit): NumberUnit {
    // force cast for flow
    if (NumberUnit.isNumberUnit(number)) return ((number: any): NumberUnit)
    else {
      deprecationWarning(
        'DEPRECATION WARNING: number-unit.add/sub usage with int or string param will be removed soon'
      )

      return new NumberUnit(number, this.unit)
    }
  }
}
