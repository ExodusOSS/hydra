const functions = ['parse', 'equals', 'toJSON']
const properties = ['units', 'baseUnit', 'defaultUnit', 'ZERO']

export default function isUnitType(obj) {
  if (obj == null) return false
  if (typeof obj !== 'object') return false
  // duck type check
  return (
    properties.every((prop) => prop in obj) &&
    functions.every((fct) => typeof obj[fct] === 'function')
  )
}
