export default function memoize(func, resolver, timeout) {
  const cache = new Map()

  function memoizedFunction(...args) {
    const key = resolver ? resolver(...args) : args[0]

    const isValidValue = !timeout || cache.get(key)?.expiry > Date.now()
    if (cache.has(key) && isValidValue) {
      return cache.get(key).value
    }

    const result = func.apply(this, args)
    cache.set(key, { value: result, expiry: Date.now() + timeout })

    return result
  }

  return memoizedFunction
}
