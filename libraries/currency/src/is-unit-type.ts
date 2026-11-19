import type UnitType from './unit-type.js'

const functions = ['parse', 'equals', 'toJSON'] as const
const properties = ['units', 'baseUnit', 'defaultUnit', 'ZERO'] as const

// allow: typeguard against arbitrary runtime value; canonical `unknown` parameter for predicate
export default function isUnitType(obj: unknown): obj is UnitType {
  if (obj == null) return false
  if (typeof obj !== 'object') return false
  // duck type check
  return (
    properties.every((prop) => prop in obj) &&
    functions.every(
      (fct) => typeof (obj as Record<(typeof functions)[number], unknown>)[fct] === 'function' // allow: cast; narrow indexed access for the known function names; alt would restructure to for-of
    )
  )
}
