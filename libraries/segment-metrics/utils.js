import { snakeCase as _snakeCase } from 'snake-case'

export const snakeCase = (input) => {
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

export const shallowMerge = (oldObj, newObj, { preserveKeys = [] } = {}) => {
  return Object.keys(newObj).reduce(
    (mergedObj, newObjKey) => {
      const key = preserveKeys.includes(newObjKey) ? newObjKey : snakeCase(newObjKey)
      safeAssign(mergedObj, key, newObj[newObjKey])
      return mergedObj
    },
    { ...oldObj }
  )
}

export const omitUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([_, v]) => v !== undefined))
