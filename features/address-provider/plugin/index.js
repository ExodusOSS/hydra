import { createAtomObserver } from '@exodus/atoms'

const createAddressProviderPlugin = ({
  knownAddresses,
  seedAddressProvider,
  addressCache,
  port,
  addressCacheAtom,
}) => {
  const addressCacheAtomObserver = createAtomObserver({
    port,
    atom: addressCacheAtom,
    event: 'addressCache',
  })

  return {
    onStart: () => {
      addressCache.load()
      knownAddresses.start()
    },
    onLoad: () => {
      addressCacheAtomObserver.start()
    },
    onStop: () => {
      addressCacheAtomObserver.unregister()
      addressCache.stop()
      knownAddresses.stop()
    },
    onClear: async () => {
      addressCache.clear()
      await seedAddressProvider?.clear?.()
    },
  }
}

const addressProviderPluginDefinition = {
  id: 'addressProviderPlugin',
  type: 'plugin',
  factory: createAddressProviderPlugin,
  dependencies: [
    'knownAddresses',
    'seedAddressProvider?',
    'addressCache',
    'port',
    'addressCacheAtom',
  ],
  public: true,
}

export default addressProviderPluginDefinition
