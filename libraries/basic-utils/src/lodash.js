// adapted from https://github.com/lodash/lodash/blob/master/test/omit.js

import assert from 'minimalistic-assert'

const assertArray = (val) => assert(Array.isArray(val), `expected Array, got ${typeof val}`)
const assertFunction = (val) =>
  assert(typeof val === 'function', `expected Function, got ${typeof val}`)

export const pick = (obj, select) => {
  assertArray(select)
  const set = new Set(select)
  return obj == null
    ? Object.create(null)
    : Object.fromEntries(Object.entries(obj).filter(([key]) => set.has(key)))
}

export const pickBy = (obj, fn) => {
  assertFunction(fn)
  return obj == null
    ? Object.create(null)
    : Object.fromEntries(Object.entries(obj).filter(([key, value]) => fn(value, key)))
}

export const omit = (obj, remove) => {
  assertArray(remove)
  return obj == null
    ? Object.create(null)
    : Object.fromEntries(Object.entries(obj).filter(([key]) => !remove.includes(key)))
}

export const omitBy = (obj, predicate) => {
  assertFunction(predicate)
  return obj
    ? Object.fromEntries(Object.entries(obj).filter(([key, value]) => !predicate(value, key)))
    : Object.create(null)
}

export const mapKeys = (obj, fn) => {
  assertFunction(fn)
  return obj == null
    ? Object.create(null)
    : Object.fromEntries(Object.entries(obj).map(([key, value]) => [fn(value, key), value]))
}

export const mapValues = (obj, fn) => {
  assertFunction(fn)
  return obj == null
    ? Object.create(null)
    : Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value, key)]))
}

export const isNil = (value) => value == null // null or undefined, == on a purpose

function sortBy(key, cb) {
  if (!cb) cb = () => 0
  return (a, b) => {
    const aValue = typeof key === 'function' ? key(a) : a[key]
    const bValue = typeof key === 'function' ? key(b) : b[key]
    return aValue > bValue ? 1 : bValue > aValue ? -1 : cb(a, b)
  }
}

function sortByDesc(key, cb) {
  if (!cb) cb = () => 0
  return (b, a) => {
    const aValue = typeof key === 'function' ? key(a) : a[key]
    const bValue = typeof key === 'function' ? key(b) : b[key]
    return aValue > bValue ? 1 : bValue > aValue ? -1 : cb(b, a)
  }
}

export const orderBy = (arr, key = [], order = []) => {
  const keys = [...(Array.isArray(key) ? key : [key])].reverse()
  const orders = [...(Array.isArray(order) ? order : [order])].reverse()
  const newArr = [...arr]
  let cb = () => 0

  for (const [i, key] of keys.entries()) {
    const order = orders[i]
    if (order === 'asc' || !order) cb = sortBy(key, cb)
    else if (order === 'desc') cb = sortByDesc(key, cb)
    else throw new Error(`Unsupported order "${order}"`)
  }

  return newArr.sort(cb)
}

export const keyBy = (arr, fnOrKey) => {
  if (typeof fnOrKey === 'string') {
    const key = fnOrKey
    if (key in {}) throw new Error('prototype key')
    fnOrKey = (obj) => obj[key]
  }

  assert(typeof fnOrKey === 'function', 'expected key string or keying function')

  const safeFnOrKey = (obj) => {
    const value = fnOrKey(obj)
    if (typeof value === 'string' && value in {}) throw new Error('prototype key')

    return value
  }

  return Object.fromEntries(arr.map((obj) => [safeFnOrKey(obj), obj]))
}

const getTag = (value) => {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]'
  }

  return Object.prototype.toString.call(value)
}

export const isObjectLike = (value) => typeof value === 'object' && value !== null

export const isPlainObject = (value) => {
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

export const difference = (a, b) => {
  assert(Array.isArray(a), 'expected 1st argument to be an Array')
  assert(Array.isArray(b), 'expected 2nd argument to be an Array')
  const bSet = new Set(b)
  return a.filter((el) => !bSet.has(el))
}

export const intersection = (a, b) => {
  assert(Array.isArray(a), 'expected 1st argument to be an Array')
  assert(Array.isArray(b), 'expected 2nd argument to be an Array')
  const bSet = new Set(b)
  return a.filter((el) => bSet.has(el))
}

export const partition = (arr, callback) => {
  assert(Array.isArray(arr), 'expected 1st argument to be an Array')
  assert(typeof callback === 'function', 'expected 2nd argument to be a Function')

  const left = []
  const right = []
  for (const item of arr) {
    callback(item) ? left.push(item) : right.push(item)
  }

  return [left, right]
}

// https://youmightnotneed.com/lodash
export const set = (obj, path, value) => {
  // Regex explained: https://regexr.com/58j0k
  const pathArray = Array.isArray(path) ? path : path.match(/([^.[\]])+/gu)

  pathArray.reduce((acc, key, i) => {
    if (key in {}) throw new Error('prototype pollution')
    if (acc[key] === undefined) acc[key] = Object.create(null)
    if (i === pathArray.length - 1) acc[key] = value
    return acc[key]
  }, obj)

  return obj
}
