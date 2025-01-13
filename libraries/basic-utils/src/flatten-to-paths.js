import { isPlainObject } from './lodash.js'

export default function flattenToPaths(object) {
  const paths = []
  if (!object) return paths

  const traverse = (next, path = []) => {
    if (isPlainObject(next)) {
      Object.entries(next).forEach(([key, value]) => traverse(value, [...path, key]))
      return
    }

    paths.push([...path, next])
  }

  traverse(object)

  return paths
}
