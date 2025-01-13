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
      let normalizeNum = someNumberUnit.to(unit1)
      let newNumber = normalizeNum._number.times(rate)
      return ut2[unit2](newNumber)
        .toBase()
        .to(unit2)
    } else if (ut.equals(ut2)) {
      // means we have 2, want 1
      let normalizeNum = someNumberUnit.to(unit2)
      let newNumber = normalizeNum._number.divide(rate)
      return ut1[unit1](newNumber)
        .toBase()
        .to(unit1)
    } else throw Error('Conversion error')
  }

  return converter
}
