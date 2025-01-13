import { SynchronizedTime } from '@exodus/basic-utils'
import { fetchival } from '@exodus/fetch'
import createWalletSdk from '@exodus/wallet-sdk'
import Emitter from '@exodus/wild-emitter'

import { createRPC } from '../utils/rpc'
import createAssetPlugins from './asset-plugins'
import createLogger from './create-logger'
import createCustomTokensStorage from './custom-tokens-storage'
import createEncryptedStorage from './encrypted-storage'
import createEnv from './env'
import createFetch from './fetch'
import createFreeze from './freeze'
import createFusion from './fusion'
import createGetBuildMetadata from './get-build-metadata'
import createIconsStorage from './icons-storage'
import createLegacyPrivToPub from './legacy-priv-to-pub'
import createSeedStorage from './seed-storage'
import createUnsafeStorage from './unsafe-storage'

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
