// eslint-disable-next-line no-restricted-imports -- false alarm
import { partition } from './lodash.js'

type AsyncIteratee<T, R> = (value: T, index: number, array: T[]) => Promise<R> | R

type AsyncMapIteratee<K extends string | number | symbol, V, R> = (
  value: V,
  key: K,
  object: Record<K, V>
) => Promise<R> | R

export const mapValuesAsync = async <K extends string | number | symbol, V, R>(
  object: Record<K, V>,
  asyncFn: AsyncMapIteratee<K, V, R>
): Promise<Record<K, R>> => {
  const entries = await Promise.all(
    Object.entries(object).map(async ([key, value]) => [
      key,
      await asyncFn(value as V, key as K, object),
    ])
  )
  return Object.fromEntries(entries) as Record<K, R>
}

export const filterAsync = async <T>(
  arr: T[],
  asyncFn: AsyncIteratee<T, boolean>
): Promise<T[]> => {
  const results = await Promise.all(arr.map((value, index, arr) => asyncFn(value, index, arr)))
  return arr.filter((_value, i) => results[i])
}

export const partitionAsync = async <T>(
  arr: T[],
  asyncFn: AsyncIteratee<T, boolean>
): Promise<[T[], T[]]> => {
  const results = await Promise.all(arr.map((value, index, arr) => asyncFn(value, index, arr)))

  let i = 0
  return partition(arr, () => results[i++]!)
}
