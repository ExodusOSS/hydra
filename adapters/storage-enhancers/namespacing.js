module.exports = function addNamespacing(storage) {
  const createAPI = (prefix = '') => {
    const processKey = (key) => {
      if (key.includes('!')) throw new Error(`keys cannot contain !; recieved ${key}`)
      return prefix + key
    }

    return {
      get: async (key) => storage.get(processKey(key)),
      batchGet: async (keys) => storage.batchGet(keys.map((key) => processKey(key))),
      set: async (key, value) => storage.set(processKey(key), value),
      batchSet: async (obj) =>
        storage.batchSet(
          Object.fromEntries(Object.entries(obj).map(([key, value]) => [processKey(key), value]))
        ),
      delete: async (key) => storage.delete(processKey(key)),
      batchDelete: async (keys) => storage.batchDelete(keys.map((key) => processKey(key))),
      clear: async () => storage.clear(prefix),
      namespace: (childPrefix) => {
        if (childPrefix.includes('!'))
          throw new Error(`prefixes cannot contain !; recieved ${childPrefix}`)
        return createAPI(`${prefix}!${childPrefix}!`)
      },
    }
  }

  return createAPI()
}
