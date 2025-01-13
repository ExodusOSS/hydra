import assert from 'minimalistic-assert'
import { addressCacheAtomDefinition } from './atoms/index.js'
import addressCacheModuleDefinition from './module/address-cache/index.js'
import addressCacheMemoryModuleDefinition from './module/address-cache/memory.js'
import disabledAddressCacheModuleDefinition from './module/address-cache/disabled.js'

const FLAVORS = new Set(['memory', 'synced', 'disabled'])

const definitions = {
  memory: [
    {
      definition: addressCacheAtomDefinition,
    },
    {
      definition: addressCacheMemoryModuleDefinition,
    },
  ],
  synced: [
    {
      definition: addressCacheAtomDefinition,
    },
    {
      definition: addressCacheModuleDefinition,
      storage: { namespace: 'addressCache' },
    },
  ],
  disabled: [
    {
      definition: addressCacheAtomDefinition,
    },
    {
      definition: disabledAddressCacheModuleDefinition,
    },
  ],
}

const addressCache = ({ config } = {}) => {
  assert(FLAVORS.has(config.flavor), 'need to pass in "config.flavor"')

  return {
    id: 'addressCache',
    definitions: definitions[config.flavor],
  }
}

export default addressCache
