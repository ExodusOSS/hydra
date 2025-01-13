import { partition } from './lodash.js'

export const mapValuesAsync = async (object, asyncFn) => {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(object).map(async ([key, value]) => [key, await asyncFn(value, key, object)])
    )
  )
}

export const filterAsync = async (arr, asyncFn) => {
  const results = await Promise.all(arr.map((value, index, arr) => asyncFn(value, index, arr)))
  return arr.filter((value, i) => results[i])
}

export const partitionAsync = async (arr, asyncFn) => {
  const results = await Promise.all(arr.map((value, index, arr) => asyncFn(value, index, arr)))

  let i = 0
  return partition(arr, () => results[i++])
}
