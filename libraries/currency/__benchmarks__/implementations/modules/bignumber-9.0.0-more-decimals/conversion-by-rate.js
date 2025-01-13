import { ok } from 'assert'
import isNumberUnit from './is-number-unit'
import UnitType from './unit-type'

export default function conversionByRate(ut1, ut2, rate, opts = {}) {
  // ut1 * rate = ut2

  ok(
    ut1 instanceof UnitType && ut2 instanceof UnitType,
    'Must pass in an instance of UnitType for ut1 and ut2.'
  )

  const { unit1, unit2 } = { unit1: ut1.defaultUnit, unit2: ut2.defaultUnit, ...opts } // allows you to specify what units the rate is for

  ok(!!ut1[unit1], `unit1 (${unit1}) is not from ut1`)
  ok(!!ut2[unit2], `unit2 (${unit2}) is not from ut2`)

  let converter = function converter(someNumberUnit) {
    ok(isNumberUnit(someNumberUnit), 'Must pass in an instance of a NumberUnit to convert.')
    const ut = someNumberUnit.unitType
    ok(ut.equals(ut1) || ut.equals(ut2), `${ut.path} should be either ${ut1.path} or ${ut2.path}`)

    if (ut.equals(ut1)) {
      // means we have 1, want 2
      let normalizeNum = someNumberUnit.to(unit1)
      let newNumber = normalizeNum._number.times(rate)
      return ut2[unit2](newNumber)
        .toBase()
        .round()
        .to(unit2)
    } else if (ut.equals(ut2)) {
      // means we have 2, want 1
      let normalizeNum = someNumberUnit.to(unit2)
      let newNumber = normalizeNum._number.div(rate)
      return ut1[unit1](newNumber)
        .toBase()
        .round()
        .to(unit1)
    }
  }

  return converter
}
