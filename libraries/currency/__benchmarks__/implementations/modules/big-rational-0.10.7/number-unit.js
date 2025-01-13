// @flow
import Decimal from 'big-rational'
import _isNumberUnit from './is-number-unit'
import { Unit } from './unit'
import UnitType from './unit-type'
import { hexToNum } from './util'

// DECIMAL_PLACES is for bignumber.js and precision is for decimal.js
// Decimal.config({ DECIMAL_PLACES: 20 })

export type NumberLike = string | number | Decimal

export default class NumberUnit {
  static create(num: NumberLike, unit: Unit) {
    return new NumberUnit(num, unit)
  }

  // so you don't have to do instanceof and get bit by different included versions
  static isNumberUnit = _isNumberUnit

  // prop types
  _number: Decimal
  unit: Unit
  unitType: UnitType
  baseUnit: Unit
  defaultUnit: Unit
  unitName: string

  constructor(num: NumberLike, unit: Unit) {
    // assert(unit instanceof Unit, 'Must specify type of Unit.')

    if (typeof num === 'string' && num.startsWith('0x')) {
      num = hexToNum(num)
    }

    this._number = Decimal(num)
    this.unit = unit

    // TODO: make these getters
    this.unitType = unit.unitType
    this.baseUnit = unit.unitType.baseUnit
    this.defaultUnit = unit.unitType.defaultUnit
    this.unitName = this.unit.unitName
  }

  abs(): NumberUnit {
    return new NumberUnit(this._number.abs(), this.unit)
  }

  add(num: NumberLike | NumberUnit): NumberUnit {
    num = this._coerceToNumberUnit(num)
    const base = num.toBase()
    const thisBase = this.toBase()
    const sumBase = base._number.add(thisBase._number)
    return new NumberUnit(sumBase, this.baseUnit).to(this.unit)
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
    let base = num.toBase()
    let thisBase = this.toBase()
    return base._number.equals(thisBase._number)
  }

  gt(num: NumberUnit): boolean {
    let base = num.toBase()
    let thisBase = this.toBase()
    return thisBase._number.gt(base._number)
  }

  gte(num: NumberUnit): boolean {
    let base = num.toBase()
    let thisBase = this.toBase()
    return thisBase._number.greaterOrEquals(base._number)
  }

  /*
  inspect(): string {
    return `<NumberUnit: ${this.toString()} >`
  }
  */

  lt(num: NumberUnit): boolean {
    let base = num.toBase()
    let thisBase = this.toBase()
    return thisBase._number.lt(base._number)
  }

  lte(num: NumberUnit): boolean {
    let base = num.toBase()
    let thisBase = this.toBase()
    return thisBase._number.lesserOrEquals(base._number)
  }

  mul(num: number): NumberUnit {
    const base = this.toBase()
    base._number = base._number.multiply(num)
    return base.to(this.unit)
  }

  floor() {
    return new NumberUnit(this._number.floor(), this.unit)
  }

  round() {
    return new NumberUnit(this._number.round(), this.unit)
  }

  ceil() {
    return new NumberUnit(this._number.ceil(), this.unit)
  }

  // TODO: deprecate
  toFixed(x: number, rm: string): NumberUnit {
    const pow = Math.pow(10, x)
    let num = this._number
    switch (rm) {
      case 'floor':
        num = num
          .multiply(pow)
          .floor()
          .divide(pow)
        break
      case 'ceil':
        num = num
          .multiply(pow)
          .ceil()
          .divide(pow)
        break
      default:
        num = num
          .multiply(pow)
          .round()
          .divide(pow)
    }

    return new NumberUnit(num.toDecimal(x), this.unit)
  }

  negate(): NumberUnit {
    return new NumberUnit(this._number.negate(), this.unit)
  }

  sub(num: NumberLike | NumberUnit): NumberUnit {
    num = this._coerceToNumberUnit(num)
    let base = num.toBase()
    let thisBase = this.toBase()
    let sumBase = thisBase._number.subtract(base._number)
    return new NumberUnit(sumBase, this.baseUnit).to(this.unit)
  }

  toBase(): NumberUnit {
    // already is base
    if (this.unit.multiplier === 1) {
      return this.clone()
    }

    let newNumber = this._number.times(this.unit.multiplier)
    return new NumberUnit(newNumber, this.baseUnit)
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
        let normalizeNum = this.to(this.unitType[conversionUnit.fromUnit])
        let newNumber = normalizeNum._number
          .times(conversionUnit.toValue)
          .divide(conversionUnit.fromValue)
        return new NumberUnit(newNumber, conversionUnit.to.unitType[conversionUnit.toUnit])
      } else {
        // new way
        return conversionUnit(this)
      }
    } else {
      // same unitType e.g. BTC to satoshis
      let base = this.toBase()
      let newNumber = base._number.divide(unit.multiplier)
      return new NumberUnit(newNumber, (unit: Unit))
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
    return this._number.valueOf()
  }

  // TODO: deprecate
  toNumberString(): string {
    return this._number.toDecimal(20)
  }

  // TODO: `format` is undocumented, consider if passing `this._number` is correct. Probably should just pass `this`
  toString({
    unit = true,
    format,
  }: { unit?: boolean, format?: (num: Decimal, unit: Unit) => string } = {}) {
    if (!format) {
      return this.toNumberString() + (unit ? ' ' + this.unitName : '')
    } else {
      return format(this._number, this.unit)
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
    return this._number.isNegative()
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
}
