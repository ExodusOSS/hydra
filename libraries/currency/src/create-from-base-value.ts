import UnitType from './unit-type.js'
import type NumberUnit from './number-unit.js'
import type { NumberLike } from './types.js'

export interface CreateFromBaseValueParams {
  value: NumberLike
  symbol: string
  power: number
}

export const createFromBaseValue = ({
  value,
  symbol,
  power,
}: CreateFromBaseValueParams): NumberUnit => {
  return UnitType.create({
    base: 0,
    [symbol]: power,
  }).baseUnit(value)
}
