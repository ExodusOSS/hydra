import BigIntWrapper from '@exodus/bigint'
import NumberUnit from './number-unit.js'
import isNumberUnit from './is-number-unit.js'
import { maybeReportDifferentTypesDeprecated } from './deprecation-warning.js'

export function create(unitType, name, power) {
  if (power < 0) throw new Error('power cannot be less than 0')

  const numberUnitCreator = function (val) {
    if (Number.isNaN(val)) throw new Error('Value NaN not supported for number unit conversion.')
    if (isNumberUnit(val)) {
      // $FlowFixMe
      maybeReportDifferentTypesDeprecated(val, numberUnitCreator, 'create')
      return val.to(numberUnitCreator)
    }

    return NumberUnit.create(val, numberUnitCreator)
  }

  numberUnitCreator.unitName = name
  numberUnitCreator.power = power
  numberUnitCreator.multiplier = BigIntWrapper.wrap(10, 10).pow(BigIntWrapper.wrap(power, 10))
  numberUnitCreator.unitType = unitType

  numberUnitCreator.toJSON = function () {
    return {
      unitName: numberUnitCreator.unitName,
      power: numberUnitCreator.power,
    }
  }

  // $FlowFixMe
  numberUnitCreator[Symbol.toStringTag] = () => {
    return String(numberUnitCreator)
  }

  // $FlowFixMe
  numberUnitCreator.toString = function () {
    return numberUnitCreator.unitName
  }

  return numberUnitCreator
}
