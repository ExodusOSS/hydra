import { Unit, create as createUnit } from './unit'
import NumberUnit from './number-unit'

type Definitions = { [unitName: string]: number }

interface UnitMap {
  [unitName: string]: Unit;
}

export default class UnitType implements UnitMap {
  static create(definitions: Definitions) {
    return new UnitType(definitions)
  }

  // [unitName: string]: any // would like this to be "Unit", but TypeScript errors pop up; Flow can't handle this
  units: UnitMap
  baseUnit: Unit
  defaultUnit: Unit

  constructor(definitions: Definitions) {
    this.units = {}

    Object.keys(definitions).forEach((key: string) => {
      this.units[key] = createUnit(this, key, definitions[key])
      // $FlowFixMe
      this[key] = this.units[key]
    })

    const baseUnits = Object.keys(this.units).filter((unit) => (this.units[unit]: Unit).power === 0)
    if (baseUnits.length === 0) throw new Error('Must specify at least one unit with a power of 0.')

    // set base unit to actual object instead of string
    this.baseUnit = (this.units[baseUnits[0]]: Unit)

    // $FlowFixMe
    this.defaultUnit = Object.values(this.units).reduce((maxUnit: Unit, unit: Unit) => {
      return ~~maxUnit.power > unit.power ? maxUnit : unit
    }, {})
  }

  /*
  // custom inspect with util.inspect.custom ?
  [Symbol.toStringTag](): string {
    return Object.values(this.units)
      .map((u) => `(${u.unitName}: ${u.power})`)
      .join(',')
  }
  */

  equals(other: UnitType): boolean {
    return this === other || this.toString() === other.toString()
  }

  parse(str: string): NumberUnit {
    const [amount, unit] = str.split(' ') // e.g. 100 bits or 150.30 USD
    if (typeof this.units[unit] === 'undefined')
      throw new Error(`Unit "${unit}" not found from parsing "${str}"`)
    return (this.units[unit]: Unit)(amount)
  }

  toString(): string {
    return String(this.defaultUnit)
  }

  get ZERO(): NumberUnit {
    return this.defaultUnit(0)
  }
}
