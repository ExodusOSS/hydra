export interface MemoizedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>
  reset: () => void
}

interface CacheEntry<T> {
  value: T
  expiry: number
}

export default function memoize<
  TFunc extends (...args: any[]) => any,
  TResolver extends (...args: Parameters<TFunc>) => any = (
    ...args: Parameters<TFunc>
  ) => Parameters<TFunc>[0],
>(func: TFunc, resolver?: TResolver, timeout?: number): MemoizedFunction<TFunc> {
  const cache = new Map<ReturnType<TResolver>, CacheEntry<ReturnType<TFunc>>>()

  function memoizedFunction(
    this: ThisParameterType<TFunc>,
    ...args: Parameters<TFunc>
  ): ReturnType<TFunc> {
    const key = resolver ? resolver(...args) : args[0]

    const isValidValue = !timeout || (cache.get(key) as any)?.expiry > Date.now()
    if (cache.has(key) && isValidValue) {
      return cache.get(key)!.value
    }

    const result = func.apply(this, args)
    cache.set(key, { value: result, expiry: Date.now() + (timeout as any) })

    return result
  }

  Object.defineProperty(memoizedFunction, 'reset', {
    value: () => cache.clear(),
    enumerable: false,
    writable: false,
  })

  return memoizedFunction as MemoizedFunction<TFunc>
}
