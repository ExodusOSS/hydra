import { isPlainObject } from '@exodus/basic-utils'

export function deepAlphabetize(obj) {
  if (Array.isArray(obj)) return obj.map((el) => deepAlphabetize(el))

  if (obj && typeof obj === 'object' && isPlainObject(obj)) {
    return Object.keys(obj)
      .sort()
      .reduce((sortedObj, key) => {
        sortedObj[key] = deepAlphabetize(obj[key])
        return sortedObj
      }, Object.create(null))
  }

  return obj
}
