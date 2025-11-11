import assert from 'minimalistic-assert'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { create as createUnit } from './unit.js'
import isUnitType from './is-unit-type.js'

const { isEmpty, isObject, mapValues, memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const FACTORY_SYMBOL = Symbol('UnitType')

const normalizeDefinitions = ({ definitions }) => {
  assert(isObject(definitions), 'definitions must be an object')
  // We rely on `sort` being stable
  // We rely on `fromEntries` not changing the key ordering
  return Object.fromEntries(Object.entries(definitions).sort((a, b) => a[1] - b[1]))
}

export default class UnitType {
  static create = memoize(
    (definitions) => new UnitType(normalizeDefinitions({ definitions }), FACTORY_SYMBOL),
    (definitions) => JSON.stringify(normalizeDefinitions({ definitions }))
  )

  static equals(a, b) {
    assert(a instanceof UnitType, 'argument must be a UnitType')
    return a === b || a.equals(b)
  }

  static isUnitType = isUnitType

  // [unitName] // would like this to be "Unit", but TypeScript errors pop up; Flow can't handle this
  units = Object.create(null)
  baseUnit
  defaultUnit

  #zero

  constructor(definitions, initSymbol) {
    assert(initSymbol === FACTORY_SYMBOL, 'please use UnitType.create()')
    assert(!isEmpty(definitions), 'definitions must have at least one item')

    Object.keys(definitions).forEach((key) => {
      this.units[key] = createUnit(this, key, definitions[key])
      // $FlowFixMe
      // @deprecated
      this[key] = this.units[key]
    })

    const baseUnits = Object.keys(this.units).filter((unit) => this.units[unit].power === 0)
    if (baseUnits.length === 0) throw new Error('Must specify at least one unit with a power of 0.')

    // base unit is the first unit (after stable ascending sort by power) with a power of zero
    this.baseUnit = this.units[baseUnits[0]]

    // default unit is the last unit (after stable ascending sort by power) with the max power
    this.defaultUnit = Object.values(this.units).reduce((maxUnit, unit) => {
      return Math.trunc(maxUnit.power) > unit.power ? maxUnit : unit
    }, Object.create(null))

    this.#zero = this.defaultUnit(0)
  }

  /*
  // custom inspect with util.inspect.custom ?
  [Symbol.toStringTag]() {
    return Object.values(this.units)
      .map((u) => `(${u.unitName}: ${u.power})`)
      .join(',')
  }
  */

  equals(other) {
    assert(isUnitType(other), 'argument must be a UnitType')
    return this === other || this.toString() === other.toString()
  }

  parse(str) {
    const [amount, unit] = str.split(' ') // e.g. 100 bits or 150.30 USD
    assert(this.units[unit] !== undefined, `Unit "${unit}" not found from parsing "${str}"`)

    return this.units[unit](amount)
  }

  toString() {
    return String(this.defaultUnit)
  }

  toJSON() {
    return mapValues(this.units, (u) => u.power)
  }

  get ZERO() {
    return this.#zero
  }
}
