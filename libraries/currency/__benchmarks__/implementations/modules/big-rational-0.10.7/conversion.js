// @flow
import NumberUnit from './number-unit'
// import { Unit } from './unit'

export default function conversion(
  num1: NumberUnit,
  num2: NumberUnit
): (num: NumberUnit) => NumberUnit {
  const ut1 = num1.unitType
  const ut2 = num2.unitType

  return function converter(someNumberUnit: NumberUnit): NumberUnit {
    const ut = someNumberUnit.unitType

    // means we have 1, want 2
    if (ut.equals(ut1)) {
      // convert someNumberUnit into the same unit as numberUnit1
      // e.g. someNumberUnit is 'km', but numberUnit1 is 'm'
      let normalizeNum = someNumberUnit.to(num1.unitName)
      let newNumber = normalizeNum._number.times(num2._number).divide(num1._number)
      return ut2[num2.unitName](newNumber)
        .toBase()
        .to(num2.unitName)
    } else if (ut.equals(ut2)) {
      // means we have 2, want 1
      let normalizeNum = someNumberUnit.to(num2.unitName)
      let newNumber = normalizeNum._number.times(num1._number).divide(num2._number)
      return ut1[num1.unitName](newNumber)
        .toBase()
        .to(num1.unitName)
    } else throw Error('Conversion error')
  }
}
