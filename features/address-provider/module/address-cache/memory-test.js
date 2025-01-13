import addressCacheMemoryModuleDefinition from './memory.js'

const createTestAddressCacheMemory = () => {
  const addressCacheMemory = addressCacheMemoryModuleDefinition.factory()

  return {
    ...addressCacheMemory,
    get: async (...args) => {
      const address = await addressCacheMemory.get(...args)
      return address && { address }
    },
    set: async ({ address, ...rest }) => {
      return addressCacheMemory.set({ ...rest, address: address.toString() })
    },
  }
}

export default createTestAddressCacheMemory
