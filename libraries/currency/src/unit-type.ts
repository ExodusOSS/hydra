import assert from 'minimalistic-assert'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { UnitTypeIdSymbol } from './constants.js'
import { create as createUnit } from './unit.js'
import isUnitType from './is-unit-type.js'
import type NumberUnit from './number-unit.js'
import type { Definitions, Unit, UnitMap } from './types.js'

const { isEmpty, isObject, mapValues, memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

const FACTORY_SYMBOL = Symbol('UnitType')

type WithCtorId = { constructor: { [UnitTypeIdSymbol]?: string } }

const normalizeDefinitions = ({ definitions }: { definitions: Definitions }): Definitions => {
  assert(isObject(definitions), 'definitions must be an object')
  // We rely on `sort` being stable
  // We rely on `fromEntries` not changing the key ordering
  return Object.fromEntries(Object.entries(definitions).sort((a, b) => a[1] - b[1]))
}

/**
 * `UnitType.create({ a: 0, b: 8 })` returns `UnitType & { a: Unit; b: Unit }`,
 * exposing the runtime-attached unit properties (the deprecated indexed-name
 * access path) to TS consumers. Use `.units[name]` instead.
 */
export type UnitTypeWithUnits<D extends Definitions> = UnitType & {
  readonly [K in keyof D]: Unit
}

export default class UnitType {
  static create: <D extends Definitions>(definitions: D) => UnitTypeWithUnits<D> = memoize(
    <D extends Definitions>(definitions: D): UnitTypeWithUnits<D> =>
      new UnitType(normalizeDefinitions({ definitions }), FACTORY_SYMBOL) as UnitTypeWithUnits<D>,
    (definitions: Definitions) => JSON.stringify(normalizeDefinitions({ definitions }))
  )

  static get [UnitTypeIdSymbol](): string {
    return 'UnitType'
  }

  /**
   * @deprecated Use `instanceof` instead.
   */
  static isInstance(instance: unknown): boolean {
    return this[Symbol.hasInstance](instance)
  }

  static [Symbol.hasInstance](instance: unknown): boolean {
    const obj = instance as WithCtorId | null | undefined
    if (!obj?.constructor || Object.hasOwn(obj, 'constructor')) {
      return false
    }

    // This is the same as `instance instanceof UnitType`, but it avoids triggering
    // the custom `hasInstance` implementation, preventing infinite recursion.
    if (Function.prototype[Symbol.hasInstance].call(UnitType, instance)) {
      return true
    }

    return obj.constructor[UnitTypeIdSymbol] === UnitType[UnitTypeIdSymbol]
  }

  static equals(a: UnitType, b: UnitType): boolean {
    assert(a instanceof UnitType, 'argument must be a UnitType')
    return a === b || a.equals(b)
  }

  static isUnitType: typeof isUnitType = isUnitType

  // [unitName] // would like this to be "Unit", but TypeScript errors pop up; Flow can't handle this
  units: UnitMap = Object.create(null) as UnitMap
  baseUnit!: Unit
  defaultUnit!: Unit

  #zero: NumberUnit

  constructor(definitions: Definitions, initSymbol: symbol) {
    assert(initSymbol === FACTORY_SYMBOL, 'please use UnitType.create()')
    assert(!isEmpty(definitions), 'definitions must have at least one item')

    Object.keys(definitions).forEach((key) => {
      this.units[key] = createUnit(this, key, definitions[key]!)
      // @deprecated indexed-name access on the UnitType instance.
      Reflect.set(this, key, this.units[key])
    })

    const baseUnits = Object.keys(this.units).filter((unit) => this.units[unit]!.power === 0)
    if (baseUnits.length === 0) throw new Error('Must specify at least one unit with a power of 0.')

    // base unit is the first unit (after stable ascending sort by power) with a power of zero
    this.baseUnit = this.units[baseUnits[0]!]!

    // default unit is the last unit (after stable ascending sort by power) with the max power
    this.defaultUnit = Object.values(this.units).reduce(
      (maxUnit, unit) => {
        return Math.trunc(maxUnit.power) > unit.power ? maxUnit : unit
      },
      Object.create(null) as Unit
    )

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

  equals(other: UnitType): boolean {
    assert(isUnitType(other), 'argument must be a UnitType')
    return this === other || this.toString() === other.toString()
  }

  parse(str: string): NumberUnit {
    const [amount, unit] = str.split(' ') // e.g. 100 bits or 150.30 USD
    assert(this.units[unit!] !== undefined, `Unit "${unit}" not found from parsing "${str}"`)

    return this.units[unit!]!(amount!)
  }

  toString(): string {
    return String(this.defaultUnit)
  }

  toJSON(): Definitions {
    return mapValues(this.units, (u) => u.power)
  }

  get ZERO(): NumberUnit {
    return this.#zero
  }
}
