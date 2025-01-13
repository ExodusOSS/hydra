import pDefer from 'p-defer'

const createCountdownLock = (keys: string[]) => {
  if (!Array.isArray(keys)) throw new TypeError('lock keys must be an array')

  for (const key of keys) {
    if (typeof key !== 'string')
      throw new TypeError(`lock keys must be all strings. Invalid ${key}`)
  }

  const deferred = pDefer()

  const unlockedKeys: string[] = []

  return {
    promise: deferred.promise,
    unlock: (key: string) => {
      if (!unlockedKeys.includes(key)) unlockedKeys.push(key)

      if (unlockedKeys.length === keys.length) {
        deferred.resolve()
        return true
      }

      return false
    },
  }
}

export default createCountdownLock
