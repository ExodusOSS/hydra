import isPlainObjectDeep from './is-plain-object-deep.js'

// finish all promises and throw if some failed
const waitPromisesFinish = async (promises) => {
  const results = await Promise.allSettled(promises)

  const errors = results
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason)

  if (errors.length > 0) {
    throw new Error('storage operation failed', { cause: errors })
  }

  return results.filter((result) => result.status === 'fulfilled').map((result) => result.value)
}

function _createStorageMemory({
  store,
  prefix = '',
  skipValueValidation = false,
  transformOnWrite = JSON.stringify,
  transformOnRead = JSON.parse,
}) {
  const processKey = (key) => {
    if (key.includes('!')) throw new Error(`keys cannot contain !; recieved ${key}`)
    return prefix + key
  }

  const _get = async (key) => {
    key = processKey(key)
    const value = store.get(key)
    return value == null ? value : transformOnRead(value)
  }

  const set = async (key, value) => {
    key = processKey(key)
    if (value === undefined) throw new Error(`cannot set ${key} to undefined`)
    if (!skipValueValidation && !isPlainObjectDeep(value))
      throw new Error(`cannot set "${key}", only plain objects supported`)
    const result = await transformOnWrite(value)
    store.set(key, result)
  }

  const _delete = (key) => {
    key = processKey(key)
    store.delete(key)
  }

  return {
    get: async (key) => _get(key),
    batchGet: async (keys) => {
      const promises = keys.map((key) => _get(key))
      return waitPromisesFinish(promises)
    },
    set,
    batchSet: async (obj) => {
      const promises = Object.entries(obj).map(([key, value]) => set(key, value))
      return waitPromisesFinish(promises)
    },
    delete: async (key) => _delete(key),
    batchDelete: async (keys) => {
      const promises = keys.map(async (key) => {
        return _delete(key)
      })

      return waitPromisesFinish(promises)
    },
    clear: async () => {
      for (const key of store.keys()) {
        if (key.startsWith(prefix)) {
          store.delete(key)
        }
      }
    },
    namespace: (_prefix) => {
      if (_prefix.includes('!')) throw new Error(`prefixes cannot contain !; recieved ${_prefix}`)
      return _createStorageMemory({
        store,
        skipValueValidation,
        transformOnRead,
        transformOnWrite,
        prefix: `${prefix}!${_prefix}!`,
      })
    },
  }
}

// wrapper function to isolate internal parameters
const createStorageMemory = ({ store = new Map(), ...opts } = {}) => {
  if (store instanceof Map) {
    return _createStorageMemory({ store, ...opts })
  }

  throw new TypeError('store must be Map')
}

export default createStorageMemory
