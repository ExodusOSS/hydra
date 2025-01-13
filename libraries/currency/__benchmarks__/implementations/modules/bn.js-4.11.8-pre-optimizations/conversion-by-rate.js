// @flow
import type { UnitType } from './unit-type'
import type NumberUnit from './number-unit'

export default function conversionByRate(
  ut1: UnitType,
  ut2: UnitType,
  rate: number | string,
  opts: { unit1?: string, unit2?: string } = {}
) {
  // ut1 * rate = ut2

  const { unit1, unit2 } = { unit1: ut1.defaultUnit, unit2: ut2.defaultUnit, ...opts } // allows you to specify what units the rate is for

  let converter = function converter(someNumberUnit: NumberUnit) {
    const ut = someNumberUnit.unitType

    if (ut.equals(ut1)) {
      // means we have 1, want 2
      return ut2
        .baseUnit(someNumberUnit._number)
        .mul(ut2[unit2].multiplier)
        .mul(rate)
        .mul(1 / ut1[unit1].multiplier)
        .to(unit2)
    } else if (ut.equals(ut2)) {
      // means we have 2, want 1
      // NOTE: we use parseFloat here. It can result in rounding issues, but doing 1/rate is hard otherwise
      // at the moment this shouldn't case us any issues theoretically
      rate = parseFloat(rate)
      return ut1
        .baseUnit(someNumberUnit._number)
        .mul(ut1[unit1].multiplier)
        .mul(rate === 0 ? 0 : 1 / rate) // no division by 0, that would crash
        .mul(1 / ut2[unit2].multiplier)
        .to(unit1)
    } else throw Error('Conversion error')
  }

  return converter
}
