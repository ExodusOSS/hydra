// NOT at_flow
// for some reason flow keeps throwing: "Cannot resolve module bn.js."
import BN from 'bn.js'
import NumberUnit from './number-unit'
import type { NumberLike } from './number-unit'
import isNumberUnit from './is-number-unit'
import UnitType from './unit-type'
import { maybeReportDifferentTypesDeprecated } from './deprecation-warning'

export interface Unit {
  (val: NumberLike | NumberUnit): NumberUnit;
  unitName: string;
  power: number;
  multiplier: BN;
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
      maybeReportDifferentTypesDeprecated(val, numberUnitCreator, 'create')
      return (val: NumberUnit).to(numberUnitCreator)
    } else {
      return NumberUnit.create((val: NumberLike), numberUnitCreator)
    }
  }

  numberUnitCreator.unitName = name
  numberUnitCreator.power = power
  numberUnitCreator.multiplier = new BN(10, 10).pow(new BN(power))
  numberUnitCreator.unitType = unitType

  numberUnitCreator.toJSON = function(): Object {
    return {
      unitName: numberUnitCreator.unitName,
      power: numberUnitCreator.power,
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
