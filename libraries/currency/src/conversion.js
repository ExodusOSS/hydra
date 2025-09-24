export default function conversion(num1, num2) {
  const ut1 = num1.unitType
  const ut2 = num2.unitType

  return function converter(someNumberUnit) {
    const ut = someNumberUnit.unitType

    // means we have 1, want 2
    if (ut.equals(ut1)) {
      // convert someNumberUnit into the same unit as numberUnit1
      // e.g. someNumberUnit is 'km', but numberUnit1 is 'm'
      const normalizeNum = someNumberUnit.to(num1.unitName)
      const newNumber = num1.isZero
        ? num1.unitType.ZERO._number
        : normalizeNum._number.mul(num2._number).div(num1._number) // no division by 0, that would crash

      if (!Object.prototype.hasOwnProperty.call(ut2, num2.unitName)) {
        throw new Error(`"${num2.unitName}" does not exist on UnitType`)
      }

      return ut2[num2.unitName](newNumber).to(num2.unitName)
    }

    if (ut.equals(ut2)) {
      // means we have 2, want 1
      const normalizeNum = someNumberUnit.to(num2.unitName)
      const newNumber = num2.isZero
        ? num2.unitType.ZERO._number
        : normalizeNum._number.mul(num1._number).div(num2._number) // no division by 0, that would crash

      if (!Object.prototype.hasOwnProperty.call(ut1, num1.unitName)) {
        throw new Error(`"${num1.unitName}" does not exist on UnitType`)
      }

      return ut1[num1.unitName](newNumber).to(num1.unitName)
    }

    throw new Error('Conversion error')
  }
}
