// @flow
import UnitType from './unit-type'
import type NumberUnit from './number-unit'

export default function conversionByRate(
  ut1: UnitType,
  ut2: UnitType,
  rate: number | string,
  opts: { unit1?: string, unit2?: string } = {}
) {
  // ut1 * rate = ut2

  if (!(ut1 instanceof UnitType) || !(ut2 instanceof UnitType))
    throw new Error('Must pass in an instance of UnitType for ut1 and ut2.')

  const { unit1, unit2 } = { unit1: ut1.defaultUnit, unit2: ut2.defaultUnit, ...opts } // allows you to specify what units the rate is for

  if (!ut1[unit1]) throw new Error(`unit1 (${unit1}) is not from ut1`)
  if (!ut2[unit2]) throw new Error(`unit2 (${unit2}) is not from ut2`)

  let converter = function converter(someNumberUnit: NumberUnit) {
    const ut = someNumberUnit.unitType

    if (ut.equals(ut1)) {
      // means we have 1, want 2
      const newUnit = ut2
        .baseUnit(someNumberUnit._number)
        .mul(ut2[unit2].multiplier)
        .mul(rate)
      newUnit._number = newUnit._number.div(ut1[unit1].multiplier)
      return newUnit.to(unit2)
    } else if (ut.equals(ut2)) {
      // means we have 2, want 1
      let newUnit = ut1.baseUnit(someNumberUnit._number).mul(ut1[unit1].multiplier)
      try {
        newUnit = newUnit.div(rate) // no throwing on division by 0, that would crash
      } catch (err) {
        if (String(err.message) !== 'Invalid division by 0') throw err // unknown error, we should rethrow
        newUnit = ut1.baseUnit(0)
      }
      newUnit._number = newUnit._number.div(ut2[unit2].multiplier)
      return newUnit.to(unit1)
    } else throw Error('Conversion error')
  }

  return converter
}
