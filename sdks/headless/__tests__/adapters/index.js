import { SynchronizedTime } from '@exodus/basic-utils'
import { fetchival } from '@exodus/fetch'
import createWalletSdk from '@exodus/wallet-sdk'
import Emitter from '@exodus/wild-emitter'

import { createRPC } from '../utils/rpc.js'
import createAssetPlugins from './asset-plugins.js'
import createLogger from './create-logger.js'
import createCustomTokensStorage from './custom-tokens-storage.js'
import createEncryptedStorage from './encrypted-storage.js'
import createEnv from './env.js'
import createFetch from './fetch.js'
import createFreeze from './freeze.js'
import createFusion from './fusion.js'
import createGetBuildMetadata from './get-build-metadata.js'
import createIconsStorage from './icons-storage.js'
import createLegacyPrivToPub from './legacy-priv-to-pub.js'
import createSeedStorage from './seed-storage.js'
import createUnsafeStorage from './unsafe-storage.js'

export default function createAdapters({ walletSdkOverrides, ...overrides } = {}) {
  const unsafeStorage = overrides.unsafeStorage ?? createUnsafeStorage()

  const multiProcessAdapters = process.env.MULTI_PROCESS && {
    walletSdk: createRPC(
      createWalletSdk({
        adapters: {
          assets: {},
          createLogger,
          legacyPrivToPub: createLegacyPrivToPub(),
          seedStorage: createSeedStorage(),
          unsafeStorage,
          storage: createEncryptedStorage(unsafeStorage),
          fetch: createFetch(),
          freeze: createFreeze(),
          port: new Emitter(),
          ...walletSdkOverrides,
        },
      }).resolve()
    ),
  }

  const singleProcessAdapters = !process.env.MULTI_PROCESS && {
    seedStorage: createSeedStorage(),
  }

  return {
    assetPlugins: createAssetPlugins(),
    createLogger,
    legacyPrivToPub: createLegacyPrivToPub(),
    unsafeStorage,
    storage: createEncryptedStorage(unsafeStorage),
    fusion: createFusion({ channelData: overrides.channelData }),
    fetch: createFetch(),
    fetchival,
    freeze: createFreeze(),
    env: createEnv(),
    getBuildMetadata: createGetBuildMetadata(),
    migrateableStorage: createEncryptedStorage(unsafeStorage),
    iconsStorage: createIconsStorage(),
    customTokensStorage: createCustomTokensStorage(),
    port: new Emitter(),
    synchronizedTime: SynchronizedTime,
    ...multiProcessAdapters,
    ...singleProcessAdapters,
    ...overrides,
  }
}
