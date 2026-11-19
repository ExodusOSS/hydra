import type NumberUnit from './number-unit.js'

/**
 * @deprecated This does not truly determine whether an object is an instance of NumberUnit. Use `instanceof NumberUnit`.
 */
// allow: typeguard against arbitrary runtime value; canonical `unknown` parameter for predicate
export default function isNumberUnit(obj: unknown): obj is NumberUnit {
  if (obj == null) return false
  if (typeof obj !== 'object') return false
  // duck type check
  return '_number' in obj && 'unit' in obj && 'unitType' in obj && 'baseUnit' in obj
}
