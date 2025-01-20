import fetch from './fetch.js'
import Emitter from '@exodus/wild-emitter'
import type { Storage } from '@exodus/storage-interface'
import createStorageMemory from '@exodus/storage-memory'
import createDeferringStorage from '@exodus/deferring-storage'
import transformStorage from '@exodus/transform-storage'
import createLogger from '@exodus/logger'
import { SynchronizedTime } from '@exodus/basic-utils'
import BJSON from 'buffer-json'
import assetPlugins from './asset-plugins.js'

import getBuildMetadata from './get-build-metadata.js'

const createStorage = () =>
  transformStorage({
    storage: <Storage<string, string>>(<unknown>createStorageMemory()),
    onRead: async (str: string | undefined) => (str === undefined ? str : BJSON.parse(str)),
    onWrite: (value) => BJSON.stringify(value),
  })

type DeferringStorage = Storage & { release: () => void }

const createUnlockableStorage = (): Storage & { unlock: () => void } => {
  const storage = createStorage()
  const { release, ...storageSpecApi } = <DeferringStorage>(
    (createDeferringStorage(storage) as unknown)
  )
  return {
    ...storageSpecApi,
    unlock: () => release(),
  }
}

const adapters = {
  createLogger,
  legacyPrivToPub: {},
  storage: createUnlockableStorage(),
  migrateableStorage: createUnlockableStorage(),
  unsafeStorage: createStorage(),
  seedStorage: createStorage(),
  fetch,
  freeze: Object.freeze,
  assetPlugins,
  getBuildMetadata,
  synchronizedTime: SynchronizedTime,
  port: new Emitter(),
  // deprecated
  customTokensStorage: createStorage().namespace('customTokens'),
  // deprecated
  iconsStorage: {
    storeIcons: async () => {
      throw new Error('iconsStorage.storeIcons not implemented')
    },
  },
}

export type Adapters = typeof adapters

export default adapters
