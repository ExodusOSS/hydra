// WARNING: be careful when implementing any deep operations
// Those are notoriously subject to prototype pollution vulnerabilities and type confusion

// Any changes or additions should be reviewed by appsec

type PlainObject = Record<string, unknown>
interface TreeNodeMap {
  [key: string]: TreeNode
}

type TreeNode = true | TreeNodeMap

// Helper types for better type inference on deepPick
// EmptyObject represents the result when no valid paths match
type EmptyObject = Record<string, never>

type PickPath<T, Path extends readonly string[]> = Path extends readonly [infer Head, ...infer Tail]
  ? Head extends keyof T
    ? Tail extends readonly string[]
      ? Tail['length'] extends 0
        ? Pick<T, Head>
        : T[Head] extends PlainObject
          ? { [K in Head]: PickPath<T[Head], Tail> }
          : EmptyObject
      : EmptyObject
    : EmptyObject
  : EmptyObject

type DeepPickResult<T, Paths> = Paths extends readonly [infer Head, ...infer Tail]
  ? Head extends readonly string[]
    ? Tail extends readonly (readonly string[])[]
      ? PickPath<T, Head> & DeepPickResult<T, Tail>
      : PickPath<T, Head>
    : EmptyObject
  : EmptyObject

const isPlainObject = (x: unknown): x is PlainObject =>
  x !== null && typeof x === 'object' && [null, Object.prototype].includes(Object.getPrototypeOf(x))

const preprocessPropertyPath = (
  path: readonly string[],
  level: number,
  leaf: TreeNodeMap,
  obj: PlainObject
): void => {
  const key = path[level]
  if (typeof key !== 'string') throw new Error('Path keys should be strings')
  if (!Object.hasOwn(obj, key)) return

  if (path.length === level + 1) {
    if (leaf[key] && leaf[key] !== true) throw new Error('Conflicting paths')

    leaf[key] = true // oxlint-disable-line @exodus/oxlint-plugin-hydra/no-param-reassign-prop-only
  } else {
    if (!leaf[key]) {
      leaf[key] = Object.create(null) // oxlint-disable-line @exodus/oxlint-plugin-hydra/no-param-reassign-prop-only
    } else if (leaf[key] === true) {
      throw new Error('Conflicting paths')
    }

    preprocessPropertyPath(path, level + 1, leaf[key] as TreeNodeMap, obj[key] as PlainObject)
  }
}

const rebuildPreprocessed = (obj: PlainObject, tree: TreeNodeMap): PlainObject => {
  if (!isPlainObject(obj)) throw new Error('Can not pick properties from a non plain object')

  const keys = Object.keys(tree)
  if (keys.length === 0) return {} // non-null prototype for consistency

  // fast path, identical to below
  if (keys.length === 1) {
    const key = keys[0]!
    const child = obj[key]
    const leaf = tree[key]!
    return { [key]: leaf === true ? child : rebuildPreprocessed(child as PlainObject, leaf) }
  }

  return Object.fromEntries(
    keys.map((key) => {
      const child = obj[key]
      const leaf = tree[key]!
      return [key, leaf === true ? child : rebuildPreprocessed(child as PlainObject, leaf)]
    })
  )
}

// Overload for better type inference when T and Paths are known
export function deepPick<T extends PlainObject, const Paths extends readonly (readonly string[])[]>(
  obj: T,
  paths: Paths
): DeepPickResult<T, Paths>

// Fallback overload for runtime/dynamic usage
export function deepPick(obj: PlainObject, paths: readonly (readonly string[])[]): PlainObject

// Implementation
export function deepPick(obj: PlainObject, paths: readonly (readonly string[])[]): PlainObject {
  if (!Array.isArray(paths)) throw new Error('Expected an array of paths')
  const tree: TreeNodeMap = Object.create(null)
  for (const p of paths) {
    if (!Array.isArray(p) || p.length === 0) throw new Error('Paths should be non-empty arrays')
    preprocessPropertyPath(p, 0, tree, obj)
  }

  return rebuildPreprocessed(obj, tree)
}
