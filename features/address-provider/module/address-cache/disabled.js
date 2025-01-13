export const createDisabledAddressCache = () => {
  return {
    get: async () => null,
    set: async () => {},
    clear: async () => {},
    load: async () => null,
    awaitSynced: async () => null,
    getMismatches: async () => ({}),
    stop: () => {},
  }
}

const disabledAddressCacheModuleDefinition = {
  id: 'addressCache',
  type: 'module',
  factory: createDisabledAddressCache,
  public: true,
}

export default disabledAddressCacheModuleDefinition
