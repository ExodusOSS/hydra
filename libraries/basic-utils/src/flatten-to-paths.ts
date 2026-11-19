// eslint-disable-next-line no-restricted-imports -- false alarm
import { isPlainObject } from './lodash.js'

type PathValue = [...path: string[], value: unknown]

export default function flattenToPaths(object: unknown): PathValue[] {
  const paths: PathValue[] = []
  if (!object) return paths

  const traverse = (next: unknown, path: string[] = []): void => {
    if (isPlainObject(next)) {
      Object.entries(next).forEach(([key, value]) => traverse(value, [...path, key]))
      return
    }

    paths.push([...path, next] as PathValue)
  }

  traverse(object)

  return paths
}
