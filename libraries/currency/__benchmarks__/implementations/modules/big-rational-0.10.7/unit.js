/* @flow */
import NumberUnit from './number-unit'
import type { NumberLike } from './number-unit'
import isNumberUnit from './is-number-unit'
import UnitType from './unit-type'

export interface Unit {
  (val: NumberLike | NumberUnit): NumberUnit;
  unitName: string;
  power: number;
  multiplier: number;
  unitType: UnitType;
  toJSON(): Object;
  toString(): string;
}

export function create(unitType: UnitType, name: string, power: number) {
  if (power < 0) throw new Error('power cannot be less than 0')

  const numberUnitCreator: any = function(val: NumberLike | NumberUnit): NumberUnit {
    if (Number.isNaN(val)) throw new Error('Value NaN not supported for number unit conversion.')
    if (isNumberUnit(val)) {
      // $FlowFixMe
      return (val: NumberUnit).to(numberUnitCreator)
    } else {
      return NumberUnit.create((val: NumberLike), numberUnitCreator)
    }
  }

  numberUnitCreator.unitName = name
  numberUnitCreator.power = power
  numberUnitCreator.multiplier = Math.pow(10, power)
  numberUnitCreator.unitType = unitType

  numberUnitCreator.toJSON = function(): Object {
    return {
      unitName: numberUnitCreator.unitName,
      multiplier: numberUnitCreator.multiplier,
      unitType: numberUnitCreator.unitType,
    }
  }

  // $FlowFixMe
  numberUnitCreator[Symbol.toStringTag] = (): string => {
    return String(numberUnitCreator)
  }

  // $FlowFixMe
  numberUnitCreator.toString = function(): string {
    return numberUnitCreator.unitName
  }

  return numberUnitCreator
}
