import { isNil, mapKeys, mapValuesAsync } from '@exodus/basic-utils'
import makeConcurrent from 'make-concurrent'

const identity = async (value) => value

const createStorage = ({
  store,
  prefix = '',
  transformOnWrite = identity,
  transformOnRead = identity,
} = {}) => {
  if (!store) throw new Error(`missing store`)

  const concurrencyLock = makeConcurrent((fn) => fn(), { concurrency: 1 })

  const processKey = (key) => {
    if (key.includes(`!`)) throw new Error(`keys cannot contain !; recieved ${key}`)
    return prefix + key
  }

  const _keys = async () => {
    return Object.keys(await store.get(null))
  }

  const _get = async (keys) => {
    keys = keys.map((key) => processKey(key))

    const result = await concurrencyLock(() => store.get(keys))

    return Promise.all(
      keys.map((key) => {
        const value = result[key]

        return isNil(value) ? value : transformOnRead(value, key)
      })
    )
  }

  const _set = async (obj) => {
    for (const key in obj) {
      if (obj[key] === undefined) throw new Error(`cannot set ${key} to undefined`)
    }

    obj = mapKeys(obj, (value, key) => processKey(key))
    obj = await mapValuesAsync(obj, transformOnWrite)

    await concurrencyLock(() => store.set(obj))
  }

  const _delete = async (keys) => {
    keys = keys.map((key) => processKey(key))
    await concurrencyLock(() => store.remove(keys))
  }

  return {
    get: async (key) => {
      const result = await _get([key])
      return result[0]
    },
    set: async (key, value) => {
      await _set({ [key]: value })
    },
    delete: async (key) => {
      await _delete([key])
    },
    clear: async () =>
      concurrencyLock(async () => {
        const keys = await _keys()

        const toRemove = keys.filter((key) => key.startsWith(prefix))
        if (toRemove.length > 0) await store.remove(toRemove)
      }),
    async batchGet(keys) {
      return _get(keys)
    },
    async batchSet(obj) {
      await _set(obj)
    },
    async batchDelete(keys) {
      await _delete(keys)
    },
    namespace: (
      newPrefix,
      {
        transformOnWrite: transformOnWriteNamespace = transformOnWrite,
        transformOnRead: transformOnReadNamespace = transformOnRead,
      } = {}
    ) => {
      if (newPrefix.includes(`!`))
        throw new Error(`newPrefixes cannot contain !; received ${newPrefix}`)

      return createStorage({
        store,
        prefix: `${prefix}!${newPrefix}!`,
        transformOnWrite: transformOnWriteNamespace,
        transformOnRead: transformOnReadNamespace,
      })
    },
  }
}

export default createStorage
