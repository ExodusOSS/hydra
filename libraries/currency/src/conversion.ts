import type NumberUnit from './number-unit.js'
import type { ConversionUnitFn } from './types.js'

export default function conversion(num1: NumberUnit, num2: NumberUnit): ConversionUnitFn {
  const ut1 = num1.unitType
  const ut2 = num2.unitType

  return function converter(someNumberUnit: NumberUnit): NumberUnit {
    const ut = someNumberUnit.unitType

    // means we have 1, want 2
    if (ut.equals(ut1)) {
      // convert someNumberUnit into the same unit as numberUnit1
      // e.g. someNumberUnit is 'km', but numberUnit1 is 'm'
      const normalizeNum = someNumberUnit.to(num1.unitName)
      const newNumber = num1.isZero
        ? num1.unitType.ZERO._number
        : normalizeNum._number.mul(num2._number).div(num1._number) // no division by 0, that would crash

      const unit = ut2.units[num2.unitName]
      if (!unit) throw new Error(`"${num2.unitName}" does not exist on UnitType`)
      return unit(newNumber).to(num2.unitName)
    }

    if (ut.equals(ut2)) {
      // means we have 2, want 1
      const normalizeNum = someNumberUnit.to(num2.unitName)
      const newNumber = num2.isZero
        ? num2.unitType.ZERO._number
        : normalizeNum._number.mul(num1._number).div(num2._number) // no division by 0, that would crash

      const unit = ut1.units[num1.unitName]
      if (!unit) throw new Error(`"${num1.unitName}" does not exist on UnitType`)
      return unit(newNumber).to(num1.unitName)
    }

    throw new Error('Conversion error')
  }
}
