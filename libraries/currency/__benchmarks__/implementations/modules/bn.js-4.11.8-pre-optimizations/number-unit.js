// NOT at_flow
// for some reason flow keeps throwing: "Cannot resolve module bn.js."
import BN from 'bn.js'
import _isNumberUnit from './is-number-unit'
import { Unit } from './unit'
import UnitType from './unit-type'
import { hexToNum } from './util'

export type NumberLike = string | number | BN

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

    this.unit = unit

    // TODO: make these getters
    this.unitType = unit.unitType
    this.baseUnit = unit.unitType.baseUnit
    this.defaultUnit = unit.unitType.defaultUnit
    this.unitName = this.unit.unitName

    if (typeof num === 'number' || typeof num === 'string') {
      let { whole, fraction, fractionLength, exponent } = this._numberToBNParts(num)

      const multiplierBN = new BN(10).pow(new BN(this.unit.power)) // TODO: put this in the unit
      this._number = whole.mul(multiplierBN)

      // positive exponent, let's make numbers bigger now so div doesn't clip
      if (exponent && !exponent.isNeg()) {
        this._number = this._number.mul(new BN(10).pow(exponent))

        if (fraction) {
          fraction = fraction.mul(new BN(10).pow(exponent))
        }
      }

      if (fraction && fractionLength) {
        const difference = fractionLength - this.unit.power
        const factor = new BN(10).pow(new BN(Math.abs(difference)))
        if (difference > 0) {
          // we have more decimals than the unit power, so:
          // 0.1234567891 => 1234567891 (_numberToBNParts did this) => 12345678.91 (what we want to do)
          // since BN is ints only, we can't multiply by a 0.01 so we need to divide by 100 instead
          fraction = fraction.div(factor)
        } else {
          fraction = fraction.mul(factor)
        }
        this._number = this._number.add(fraction)
      }

      // negative exponent, we do it last so it doesn't clip intermediate values
      if (exponent && exponent.isNeg()) {
        this._number = this._number.div(new BN(10).pow(exponent.neg()))
      }
    }

    this._number = this._number || new BN(num)
  }

  abs(): NumberUnit {
    return new NumberUnit(this._number.abs(), this.unit)
  }

  add(num: NumberLike | NumberUnit): NumberUnit {
    num = this._coerceToNumberUnit(num)
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
    return this._number.eq(num._number)
  }

  gt(num: NumberUnit): boolean {
    return this._number.gt(num._number)
  }

  gte(num: NumberUnit): boolean {
    return this._number.gte(num._number)
  }

  /*
  inspect(): string {
    return `<NumberUnit: ${this.toString()} >`
  }
  */

  lt(num: NumberUnit): boolean {
    return this._number.lt(num._number)
  }

  lte(num: NumberUnit): boolean {
    return this._number.lte(num._number)
  }

  mul(num: number | string): NumberUnit {
    let { whole, fraction, fractionLength, exponent } = this._numberToBNParts(num)

    let result = this._number.mul(whole)

    // positive exponent, let's make numbers bigger now so div doesn't clip
    if (exponent && !exponent.isNeg()) {
      result = result.mul(new BN(10).pow(exponent))

      if (fraction) {
        fraction = fraction.mul(new BN(10).pow(exponent))
      }
    }

    // 1.2 * 5 => (1 + 0.2) * 5 => 1 * 5 + 0.2 * 5
    if (fraction && fractionLength) {
      const fractionPart = this._number.mul(fraction).div(new BN(10).pow(new BN(fractionLength)))
      result = result.add(fractionPart)
    }

    // negative exponent, we do it last so it doesn't clip intermediate values
    if (exponent && exponent.isNeg()) {
      result = result.div(new BN(10).pow(exponent.neg()))
    }

    return new NumberUnit(result, this.unit)
  }

  floor() {
    if (this.unit.multiplier === 1) {
      return this
    } else {
      const num = this.toNumberString()
      const [whole] = num.split('.')
      return new NumberUnit(whole, this.unit)
    }
  }

  round() {
    if (this.unit.multiplier === 1) {
      return this
    } else {
      const num = this.toNumberString()
      const [whole, fraction] = num.split('.')
      let newNumber = new NumberUnit(whole, this.unit)

      if (fraction && Math.round(parseFloat(`0.${fraction}`)) > 0) {
        newNumber = newNumber.add(new NumberUnit(1, this.unit))
      }

      return newNumber
    }
  }

  ceil() {
    if (this.unit.multiplier === 1) {
      return this
    } else {
      const num = this.toNumberString()
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
    const factor = new BN(10).pow(new BN(x))
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
    return new NumberUnit(this._number.sub(num._number), this.unit)
  }

  toBase(): NumberUnit {
    // already is base
    if (this.unit.multiplier === 1) {
      return this.clone()
    }

    return new NumberUnit(this._number, this.baseUnit)
  }

  toDefault(): NumberUnit {
    return this.to(this.defaultUnit)
  }

  // with 'conversionUnit' usage is deprecated
  to(unit: string | Unit | Object | UnitType, conversionUnit?: any): NumberUnit {
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
        return conversionUnit.to.unitType
          .baseUnit(this._number)
          .mul(conversionUnit.to.unitType[conversionUnit.toUnit].multiplier)
          .mul(parseFloat(conversionUnit.toValue) / parseFloat(conversionUnit.fromValue))
          .mul(1 / conversionUnit.from.unitType[conversionUnit.fromUnit].multiplier)
          .to(conversionUnit.toUnit)
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
      value: this.toNumberString(),
      unit: this.unitName,
      unitType: this.unitType.toString(),
      type: 'NumberUnit',
    }
  }

  toNumber(): number {
    return parseFloat(this.toNumberString())
  }

  // TODO: deprecate
  toNumberString(): string {
    let num = this._number.toString(10)
    if (this.unit.multiplier !== 1) {
      let { div, mod } = this._number.divmod(new BN(10).pow(new BN(this.unit.power))) // TODO: if in unit, use it from there this.unit.powerBN?

      num = div.toString(10)

      if (!mod.isZero()) {
        mod = mod
          .abs()
          .toString(10)
          .padStart(this.unit.power, '0')

        while (mod.endsWith('0')) mod = mod.slice(0, -1)

        // handle case when div is 0 so we lose the negative
        if (this._number.isNeg() && !num.startsWith('-')) {
          num = `-${num}`
        }

        num = `${num}.${mod}`
      }
    }
    return num
  }

  // TODO: `format` is undocumented, consider if passing `this._number` is correct. Probably should just pass `this`
  toString({
    unit = true,
    format,
  }: { unit?: boolean, format?: (num: BN, unit: Unit) => string } = {}) {
    if (!format) {
      return this.toNumberString() + (unit ? ' ' + this.unitName : '')
    } else {
      // passing toNumberString here to maintain compatibility with previous versions
      return format(this.toNumberString(), this.unit)
    }
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

  get isZero(): boolean {
    return this._number.isZero()
  }

  // convert 'number' / 'string' to NumberUnit
  _coerceToNumberUnit(number: NumberLike | NumberUnit): NumberUnit {
    // force cast for flow
    if (NumberUnit.isNumberUnit(number)) return ((number: any): NumberUnit)
    else {
      try {
        // try/catch might be excessive, but I don't know if any of this would throw on rn vs electron
        console.warn('***************************************************************')
        console.warn(
          'DEPRECATION WARNING: number-unit.add/sub usage with int or string param will be removed soon'
        )
        console.warn('***************************************************************')
        console.trace()
      } catch (err) {}

      return new NumberUnit(number, this.unit)
    }
  }

  // parse a 'number' / 'string' so it can be converted to BN
  _numberToBNParts(
    num: string | number
  ): { whole: BN, fraction?: BN, fractionLength?: number, exponent?: BN } {
    let whole, fraction, fractionLength, exponent

    num = String(num)

    // 0xaf
    if (num.startsWith('0x')) {
      num = hexToNum(num)
    }

    // +1.2 => 1.2
    if (num.startsWith('+')) {
      num = num.slice(1)
    }

    // handle 1.2e+10 and 1.2e-10
    if (num.includes('e+')) {
      let [newNum, exponentStr] = num.split('e+')
      num = newNum
      exponent = new BN(exponentStr)
    } else if (num.includes('e-')) {
      let [newNum, exponentStr] = num.split('e-')
      num = newNum
      exponent = new BN(`-${exponentStr}`)
    }

    // no hex that doesn't start with 0x
    if (/[A-F]/i.test(num)) throw new Error(`@exodus/currency:XXX() ${num} does not begin with 0x.`)

    // fractions need to be split into their parts
    let [wholeStr, fractionStr] = num.split('.')

    whole = new BN(wholeStr)

    if (fractionStr) {
      // remove trailing 0s
      while (fractionStr.endsWith('0')) fractionStr = fractionStr.slice(0, -1)
      fractionLength = fractionStr.length

      fraction = new BN(fractionStr)
      // isNeg doesn't catch -0.5 since 0 is not negative
      if (whole.isNeg() || num.startsWith('-')) fraction = fraction.neg()
    }

    return { whole, fraction, fractionLength, exponent }
  }
}
