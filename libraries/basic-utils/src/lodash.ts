// adapted from https://github.com/lodash/lodash/blob/master/test/omit.js

import assert from 'minimalistic-assert'

const assertArray = (val: unknown): void =>
  assert(Array.isArray(val), `expected Array, got ${typeof val}`)

const assertFunction = (val: unknown): void =>
  assert(typeof val === 'function', `expected Function, got ${typeof val}`)

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T | null | undefined,
  select: readonly K[]
): Pick<T, K> => {
  assertArray(select)
  return obj == null
    ? (Object.create(null) as Pick<T, K>)
    : (Object.fromEntries(
        select.filter((k) => Object.hasOwn(obj, k as string)).map((k) => [k, obj[k]])
      ) as Pick<T, K>)
}

export const pickBy = <T extends Record<string, any>>(
  obj: T | null | undefined,
  fn: (value: T[keyof T], key: string) => boolean
): Partial<T> => {
  assertFunction(fn)
  return obj == null
    ? (Object.create(null) as Partial<T>)
    : (Object.fromEntries(
        Object.entries(obj).filter(([key, value]) => fn(value, key))
      ) as Partial<T>)
}

export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T | null | undefined,
  remove: readonly K[]
): Omit<T, K> => {
  assertArray(remove)
  return obj == null
    ? (Object.create(null) as Omit<T, K>)
    : (Object.fromEntries(
        Object.entries(obj).filter(([key]) => !remove.includes(key as K))
      ) as Omit<T, K>)
}

export const omitBy = <T extends Record<string, any>>(
  obj: T | null | undefined,
  predicate: (value: T[keyof T], key: string) => boolean
): Partial<T> => {
  assertFunction(predicate)
  return obj
    ? (Object.fromEntries(
        Object.entries(obj).filter(([key, value]) => !predicate(value, key))
      ) as Partial<T>)
    : (Object.create(null) as Partial<T>)
}

export const mapKeys = <T extends Record<string, any>, K extends string = string>(
  obj: T | null | undefined,
  fn: (value: T[keyof T], key: string) => K
): Record<K, T[keyof T]> => {
  assertFunction(fn)
  return obj == null
    ? (Object.create(null) as Record<K, T[keyof T]>)
    : (Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [fn(value, key), value])
      ) as Record<K, T[keyof T]>)
}

export const mapValues = <T extends Record<string, any>, R>(
  obj: T | null | undefined,
  fn: (value: T[keyof T], key: string) => R
): Record<keyof T, R> => {
  assertFunction(fn)
  return obj == null
    ? (Object.create(null) as Record<keyof T, R>)
    : (Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [key, fn(value, key)])
      ) as Record<keyof T, R>)
}

export const isNil = (value: unknown): value is null | undefined => value == null // null or undefined, == on a purpose

type SortKey<T> = keyof T | ((item: T) => any)
type SortOrder = 'asc' | 'desc'
type SortCallback<T> = (a: T, b: T) => number

function sortBy<T>(key: SortKey<T>, cb?: SortCallback<T>): SortCallback<T> {
  if (!cb) cb = () => 0
  return (a: T, b: T) => {
    const aValue = typeof key === 'function' ? key(a) : a[key]
    const bValue = typeof key === 'function' ? key(b) : b[key]
    return aValue > bValue ? 1 : bValue > aValue ? -1 : cb(a, b)
  }
}

function sortByDesc<T>(key: SortKey<T>, cb?: SortCallback<T>): SortCallback<T> {
  if (!cb) cb = () => 0
  return (b: T, a: T) => {
    const aValue = typeof key === 'function' ? key(a) : a[key]
    const bValue = typeof key === 'function' ? key(b) : b[key]
    return aValue > bValue ? 1 : bValue > aValue ? -1 : cb(b, a)
  }
}

export const orderBy = <T>(
  arr: readonly T[],
  key: SortKey<T> | SortKey<T>[] = [],
  order: SortOrder | SortOrder[] = []
): T[] => {
  const keys = [...(Array.isArray(key) ? key : [key])].reverse()
  const orders = [...(Array.isArray(order) ? order : [order])].reverse()
  const newArr = [...arr]
  let cb: SortCallback<T> = () => 0

  for (const [i, key] of keys.entries()) {
    const order = orders[i]
    if (order === 'asc' || !order) cb = sortBy(key, cb)
    else if (order === 'desc') cb = sortByDesc(key, cb)
    else throw new Error(`Unsupported order "${order}"`)
  }

  return newArr.sort(cb)
}

export const keyBy = <T extends Record<string, any>>(
  arr: readonly T[],
  fnOrKey: keyof T | ((obj: T) => string | number)
): Record<string | number, T> => {
  let keyFn: (obj: T) => string | number

  if (typeof fnOrKey === 'string') {
    const key = fnOrKey
    if (key in {}) throw new Error('prototype key')
    keyFn = (obj: T) => obj[key] as string | number
  } else if (typeof fnOrKey === 'function') {
    keyFn = fnOrKey
  } else {
    assert(false, 'expected key string or keying function')
  }

  const safeFnOrKey = (obj: T) => {
    const value = keyFn(obj)
    if (typeof value === 'string' && value in {}) {
      throw new Error('prototype key')
    }

    return value
  }

  return Object.fromEntries(arr.map((obj) => [safeFnOrKey(obj), obj]))
}

const getTag = (value: unknown): string => {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }

  return Object.prototype.toString.call(value)
}

export const isObjectLike = (value: unknown): value is object =>
  typeof value === 'object' && value !== null

export const isPlainObject = (value: unknown): value is Record<string, any> => {
  if (!isObjectLike(value) || getTag(value) !== '[object Object]') {
    return false
  }

  if (Object.getPrototypeOf(value) === null) {
    return true
  }

  let proto = value
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(value) === proto
}

export const difference = <T>(a: readonly T[], b: readonly T[]): T[] => {
  assert(Array.isArray(a), 'expected 1st argument to be an Array')
  assert(Array.isArray(b), 'expected 2nd argument to be an Array')
  const bSet = new Set(b)
  return a.filter((el) => !bSet.has(el))
}

export const intersection = <T>(a: readonly T[], b: readonly T[]): T[] => {
  assert(Array.isArray(a), 'expected 1st argument to be an Array')
  assert(Array.isArray(b), 'expected 2nd argument to be an Array')
  const bSet = new Set(b)
  return a.filter((el) => bSet.has(el))
}

// `item is U` constrains only the true branch, so the fail array is at most
// `Exclude<T, U>`. When the guard doesn't narrow the element type (`Exclude<T,
// U>` collapses to `never`), fall back to `T` rather than lying with `never[]`.
type PartitionRest<T, U> = [Exclude<T, U>] extends [never] ? T : Exclude<T, U>

type Partition = {
  <T, U extends T>(
    arr: readonly T[],
    callback: (item: T) => item is U
  ): [U[], PartitionRest<T, U>[]]
  <T>(arr: readonly T[], callback: (item: T) => boolean): [T[], T[]]
}

export const partition = (<T>(arr: readonly T[], callback: (item: T) => boolean): [T[], T[]] => {
  assert(Array.isArray(arr), 'expected 1st argument to be an Array')
  assert(typeof callback === 'function', 'expected 2nd argument to be a Function')

  const left: T[] = []
  const right: T[] = []
  for (const item of arr) {
    // oxlint-disable-next-line no-unused-expressions
    callback(item) ? left.push(item) : right.push(item)
  }

  return [left, right]
}) as Partition

type PathArray = readonly (string | number)[]
type Path = string | PathArray

// https://youmightnotneed.com/lodash
export const set = <T extends Record<string, any>>(obj: T, path: Path, value: any): T => {
  // Regex explained: https://regexr.com/58j0k
  const pathArray = Array.isArray(path) ? path : (path as string).match(/([^.[\]])+/gu)
  if (!pathArray) throw new Error('invalid path')

  void pathArray.reduce((acc: any, key: any, i: number) => {
    if (key in {}) throw new Error('prototype pollution')

    if (acc[key] === undefined) acc[key] = Object.create(null)
    if (i === pathArray.length - 1) acc[key] = value
    return acc[key]
  }, obj)

  return obj
}
