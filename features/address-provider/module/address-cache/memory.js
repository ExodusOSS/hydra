// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import assert from 'minimalistic-assert'
import { set } from '@exodus/basic-utils'
import { getCachePath } from './utils.js'

const { get } = lodash

export const createAddressCache = () => {
  let cache = Object.create(null)
  return {
    get: async ({ baseAssetName, walletAccountName, derivationPath, multisigDataIndex }) => {
      assert(typeof walletAccountName === 'string', 'expected string "walletAccountName"')
      assert(typeof derivationPath === 'string', 'expected string "derivationPath"')
      assert(typeof baseAssetName === 'string', 'expected string "baseAssetName"')
      assert(
        multisigDataIndex === undefined || typeof multisigDataIndex === 'number',
        'expected number "multisigDataIndex"'
      )

      const path = getCachePath({
        baseAssetName,
        walletAccountName,
        derivationPath,
        multisigDataIndex,
      })
      return get(cache, path)
    },
    set: async ({
      baseAssetName,
      walletAccountName,
      derivationPath,
      multisigDataIndex,
      address,
    }) => {
      assert(typeof walletAccountName === 'string', 'expected string "walletAccountName"')
      assert(typeof derivationPath === 'string', 'expected string "derivationPath"')
      assert(typeof baseAssetName === 'string', 'expected string "baseAssetName"')
      assert(
        multisigDataIndex === undefined || typeof multisigDataIndex === 'number',
        'expected number "multisigDataIndex"'
      )

      const path = getCachePath({
        baseAssetName,
        walletAccountName,
        derivationPath,
        multisigDataIndex,
      })
      set(cache, path, address)
    },
    clear: async () => {
      cache = Object.create(null)
    },
    load: async () => null,
    awaitSynced: async () => null,
    getMismatches: async () => Object.create(null),
    stop: () => {},
  }
}

const addressCacheMemoryModuleDefinition = {
  id: 'addressCache',
  type: 'module',
  factory: createAddressCache,
  public: true,
}

export default addressCacheMemoryModuleDefinition
