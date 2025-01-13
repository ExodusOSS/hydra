import NumberUnit from './number-unit'
import isNumberUnit from './is-number-unit'

export function create(unitType, name, power) {
  let numberUnitCreator = (val) => {
    if (isNumberUnit(val)) {
      return val.to(numberUnitCreator)
    } else {
      return NumberUnit.create(val, numberUnitCreator)
    }
  }

  numberUnitCreator.unitName = name
  numberUnitCreator.power = power
  numberUnitCreator.multiplier = Math.pow(10, power)
  numberUnitCreator.unitType = unitType

  numberUnitCreator.toJSON = function() {
    return {
      unitName: numberUnitCreator.unitName,
      multiplier: numberUnitCreator.multiplier,
      unitType: numberUnitCreator.unitType.path,
    }
  }

  numberUnitCreator.inspect = function() {
    return numberUnitCreator.toJSON()
  }

  numberUnitCreator.toString = function() {
    return numberUnitCreator.unitName
  }

  return numberUnitCreator
}
