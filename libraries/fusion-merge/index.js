'use strict'

// NOTE: this doesn't create a clone for mismatching entries, it reuses existing ones where possible

// NOTE: unlike merge-deep, e.g. arrays are not merged, this replaces arrays

// NOTE: works only on JSON-compatible plain objects
// Other objects will be replaced, not merged

// NOTE: empty object keys replace existing object keys
// e.g. merge({ foo: { bar: 0 } }, { foo: {} }) => { foo: {} }

module.exports = function fusionMerge(a, b) {
  if (typeof a !== typeof b || a === undefined || a === null || b === undefined || b === null)
    return b

  // check if both values are objects (including null prototype objects)
  if (
    !(
      [Object.prototype, null].includes(Object.getPrototypeOf(a)) &&
      [Object.prototype, null].includes(Object.getPrototypeOf(b))
    )
  )
    return b

  const entries = Object.entries(b)
  // empty objects replace
  if (entries.length === 0) return b
  const map = new Map(Object.entries(a))
  for (const [key, value] of entries) {
    map.set(key, map.has(key) ? fusionMerge(map.get(key), value) : value)
  }

  return Object.fromEntries(map)
}
