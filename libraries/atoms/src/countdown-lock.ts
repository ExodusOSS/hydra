import pDefer from 'p-defer'

const createCountdownLock = (keys: string[]) => {
  if (!Array.isArray(keys)) throw new TypeError('lock keys must be an array')

  for (const key of keys) {
    if (typeof key !== 'string') {
      throw new TypeError(`lock keys must be all strings. Invalid ${key}`)
    }
  }

  const uniqueKeys = new Set(keys)

  const deferred = pDefer()

  const unlockedKeys = new Set<string>()

  return {
    promise: deferred.promise,
    unlock: (key: string) => {
      if (uniqueKeys.has(key)) unlockedKeys.add(key)

      if (unlockedKeys.size === uniqueKeys.size) {
        deferred.resolve()
        return true
      }

      return false
    },
  }
}

export default createCountdownLock
