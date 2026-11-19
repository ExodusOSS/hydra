import BigIntWrapper from '@exodus/bigint'
import NumberUnit from './number-unit.js'
import isNumberUnit from './is-number-unit.js'
import { maybeReportDifferentTypesDeprecated } from './deprecation-warning.js'
import type { NumberLike, Unit } from './types.js'
import type UnitType from './unit-type.js'

export function create(unitType: UnitType, name: string, power: number): Unit {
  if (power < 0) throw new Error('power cannot be less than 0')

  const numberUnitCreator = function (val: NumberLike | NumberUnit): NumberUnit {
    if (Number.isNaN(val)) throw new Error('Value NaN not supported for number unit conversion.')
    if (isNumberUnit(val)) {
      maybeReportDifferentTypesDeprecated(val, numberUnitCreator, 'create')
      return val.to(numberUnitCreator)
    }

    return NumberUnit.create(val, numberUnitCreator)
  } as Unit // allow: cast; subsequent assignments populate the Unit shape verbatim from the original JS; alt would be Object.assign which changes the runtime property-installation order

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

  // allow: Symbol.toStringTag is not on the Unit interface; widened via intersection at the assignment site
  ;(numberUnitCreator as Unit & { [Symbol.toStringTag]: () => string })[Symbol.toStringTag] =
    () => {
      return String(numberUnitCreator)
    }

  numberUnitCreator.toString = function () {
    return numberUnitCreator.unitName
  }

  return numberUnitCreator
}
