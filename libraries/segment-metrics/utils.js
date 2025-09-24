const { snakeCase: _snakeCase } = require('snake-case')

const snakeCase = (input) => {
  return _snakeCase(input).replace(/([A-Za-z])(\d+)/gu, '$1_$2')
}

const safeAssign = (obj, key, value) => {
  const descriptor = {
    __proto__: null,
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  }
  Object.defineProperty(obj, key, descriptor)
  return obj
}

const shallowMerge = (oldObj, newObj) => {
  return Object.keys(newObj).reduce(
    (mergedObj, newObjKey) => {
      safeAssign(mergedObj, snakeCase(newObjKey), newObj[newObjKey])
      return mergedObj
    },
    { ...oldObj }
  )
}

const omitUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined))

module.exports = { snakeCase, shallowMerge, omitUndefined }
