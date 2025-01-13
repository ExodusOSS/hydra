import UnitType from './unit-type.js'

export const createFromBaseValue = ({ value, symbol, power }) => {
  return UnitType.create({
    base: 0,
    [symbol]: power,
  }).baseUnit(value)
}
