import type BigIntWrapper from '@exodus/bigint'
import type NumberUnit from './number-unit.js'
import type UnitType from './unit-type.js'

/**
 * Legacy bn.js-shaped value. `@exodus/currency` historically accepted these
 * in the `Unit` factory (the constructor's `isMaybeBN` branch handles them,
 * throwing for non-base units and accepting for `baseUnit`). New code should
 * pass `bigint`, `BigIntWrapper`, `string`, or `number` instead.
 */
export interface BNLike {
  constructor: { wordSize: number }
  words: number[]
  toString(): string
}

export type NumberLike = string | number | bigint | BigIntWrapper | BNLike

export interface Unit {
  (val: NumberLike | NumberUnit): NumberUnit
  unitName: string
  power: number
  multiplier: BigIntWrapper
  unitType: UnitType
  toJSON(): { unitName: string; power: number }
  toString(): string
}

export type Definitions = Record<string, number>

export type UnitMap = Record<string, Unit>

export type ConversionUnitFn = (numberUnit: NumberUnit) => NumberUnit

export interface ConversionUnitObject {
  // Only `.unitType` is consumed at runtime — both `Unit` (callable) and
  // `NumberUnit` (instance) satisfy that minimum contract, matching the
  // permissive runtime accepted by `NumberUnit.to()`.
  from: Unit | NumberUnit
  to: Unit | NumberUnit
  fromValue: string | number
  toValue: string | number
  fromUnit?: string
  toUnit?: string
}

export type NumberFraction = {
  number: string
  fraction: string
  fractionLength: number
}
