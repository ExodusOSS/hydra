import { ok } from 'assert'
import Decimal from 'bignumber.js'
// import Decimal from 'decima.js'
import _isNumberUnit from './is-number-unit'
// import Unit from './unit'

// DECIMAL_PLACES is for bignumber.js and precision is for decimal.js
Decimal.config({ ERRORS: false, DECIMAL_PLACES: 40, precision: 40, EXPONENTIAL_AT: 50 })

export default class NumberUnit {
  static create(number, unit, options) {
    return new NumberUnit(number, unit, options)
  }

  // so you don't have to do instanceof and get bit by different included versions
  static isNumberUnit = _isNumberUnit

  static strict = false

  constructor(number, unit, { strict } = {}) {
    // assert(unit instanceof Unit, 'Must specify type of Unit.')
    this._number = new Decimal(number)
    this.unit = unit

    // TODO: make these getters
    this.unitType = unit.unitType
    this.baseUnit = unit.unitType.baseUnit
    this.defaultUnit = unit.unitType.defaultUnit
    this.unitName = this.unit.unitName

    // default to static, which is false
    this.strict = strict == null ? NumberUnit.strict : strict
    // this._baseNumber = this._number.times(unit.multiplier)
  }

  abs() {
    return new NumberUnit(this._number.abs(), this.unit, { strict: this.strict })
  }

  add(number) {
    number = this._coerceToNumberUnit(number)
    let base = number.toBase()
    let thisBase = this.toBase()
    let sumBase = base._number.plus(thisBase._number)
    return new NumberUnit(sumBase, this.baseUnit).to(this.unit)
  }

  clampLowerZero() {
    const zero = new NumberUnit(0, this.unit)
    if (this.gte(zero)) return this
    else return zero
  }

  clone() {
    return new NumberUnit(this._number, this.unit)
  }

  equals(number) {
    let base = number.toBase()
    let thisBase = this.toBase()
    return base._number.isEqualTo(thisBase._number)
  }

  gt(number) {
    let base = number.toBase()
    let thisBase = this.toBase()
    return thisBase._number.gt(base._number)
  }

  gte(number) {
    let base = number.toBase()
    let thisBase = this.toBase()
    return thisBase._number.gte(base._number)
  }

  inspect() {
    return `<NumberUnit: ${this.toString()} >`
  }

  lt(number) {
    let base = number.toBase()
    let thisBase = this.toBase()
    return thisBase._number.lt(base._number)
  }

  lte(number) {
    let base = number.toBase()
    let thisBase = this.toBase()
    return thisBase._number.lte(base._number)
  }

  mul(num: number): NumberUnit {
    const base = this.toBase()
    base._number = base._number.times(num).toFixed(0)
    return base.to(this.unit)
  }

  floor() {
    return this.toFixed(0, 'floor')
  }

  round() {
    return this.toFixed(0)
  }

  ceil() {
    return this.toFixed(0, 'ceil')
  }

  toFixed(x, rm) {
    if (rm === 'floor') rm = 3
    if (rm === 'ceil') rm = 2
    return new NumberUnit(this._number.toFixed(x, rm), this.unit, { strict: this.strict })
  }

  negate() {
    return new NumberUnit(this._number.negated(), this.unit, { strict: this.strict })
  }

  sub(number) {
    number = this._coerceToNumberUnit(number)
    let base = number.toBase()
    let thisBase = this.toBase()
    let sumBase = thisBase._number.minus(base._number)
    return new NumberUnit(sumBase, this.baseUnit).to(this.unit)
  }

  toBase() {
    // already is base
    if (this.unit.multiplier === 1) {
      return this.clone()
    }

    let newNumber = this._number.times(this.unit.multiplier)
    return new NumberUnit(newNumber, this.baseUnit)
  }

  toDefault() {
    return this.to(this.defaultUnit)
  }

  // with 'conversionUnit' usage is deprecated
  to(unit, conversionUnit) {
    // e.g. 'bits'
    if (typeof unit === 'string') {
      unit = this.unitType.units[unit]
    }
    ok(
      typeof unit === 'string' || typeof unit === 'function',
      'Unit must be either a string or a function from UnitType.'
    )

    if (!this.unitType.equals(unit.unitType)) {
      if (!conversionUnit) throw new Error('Incompatible unit types. Must specify a conversion.')

      // deprecated
      if (typeof conversionUnit !== 'function') {
        if (!this.unitType.equals(conversionUnit.from.unitType))
          throw new Error('Conversion unit from is of different type.')
        let normalizeNum = this.to(this.unitType[conversionUnit.fromUnit])
        let newNumber = normalizeNum._number
          .times(conversionUnit.toValue)
          .div(conversionUnit.fromValue)
        return new NumberUnit(newNumber, conversionUnit.to.unitType[conversionUnit.toUnit])
      } else {
        // new way
        return conversionUnit(this)
      }
    } else {
      // same unitType e.g. BTC to satoshis
      var base = this.toBase()
      let newNumber = base._number.div(unit.multiplier)
      return new NumberUnit(newNumber, unit)
    }
  }

  // this is only here to prevent JSON stringify circular error
  // you should probably use toString() in conjunction with parse()
  // a corresponding fromJSON probably won't ever be implemented
  toJSON() {
    return {
      value: this._number.toString(),
      unit: this.unitName,
      unitType: String(this.unitType),
      type: 'NumberUnit',
    }
  }

  toNumber() {
    return this._number.toNumber()
  }

  toNumberString() {
    return this._number.toString()
  }

  // TODO: `format` is undocumented, consider if passing `this._number` is correct. Probably should just pass `this`
  toString({ unit = true, format = undefined } = {}) {
    if (!format) {
      return this._number.toString() + (unit ? ' ' + this.unitName : '')
    } else {
      return format(this._number, this.unit)
    }
  }

  // TODO: consider returning base unit
  valueOf() {
    return this.toDefault().toNumber()
  }

  // NOTE: for debugging, should probably use Chrome Formatter:
  // https://docs.google.com/document/d/1FTascZXT9cxfetuPRT2eXPQKXui4nWFivUnS_335T3U/preview
  get value(): string {
    return this.toString()
  }

  get isNegative() {
    return this._number.isNegative()
  }

  get isZero() {
    return this.toNumber() === 0
  }

  // convert 'number' / 'string' to NumberUnit
  _coerceToNumberUnit(number) {
    let isNU = NumberUnit.isNumberUnit(number)
    if (!isNU && this.strict)
      throw new Error(
        "Strict mode: can't perform operation on anything other than instance of NumberUnit"
      )
    if (isNU) return number
    else return new NumberUnit(number, this.unit)
  }
}
