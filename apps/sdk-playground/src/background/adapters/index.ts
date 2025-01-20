import Emitter from '@exodus/wild-emitter'
import { SynchronizedTime } from '@exodus/basic-utils'
import createIconsStorageModule from '@exodus/storage-icons-browser'
import createDeferringStorage from '@exodus/deferring-storage'
import assetPlugins from './asset-plugins.js'
import getBuildMetadata from './get-build-metadata.js'
import createStorage from './storage.js'
import createLogger from '../../utils/logger.js'
import createKeychainMock from '@exodus/keystore-mobile/src/__tests__/keychain-mock-no-jest.js'
import createKeystore from '@exodus/keystore-mobile'

const createUnlockableStorage = (storage) => {
  const deferringStorage = createDeferringStorage(storage)
  // headless will call 'unlock' on the unlock lifecycle hook if available
  Object.defineProperty(deferringStorage, 'unlock', {
    value: () => deferringStorage.release(),
    configurable: true,
  })

  return deferringStorage
}

const storageRoot = createStorage()
const seedStorage = storageRoot.namespace('seed')
const unsafeStorage = storageRoot.namespace('unsafe')
const secureStorage = storageRoot.namespace('secure')

const keystore = createKeystore({
  reactNativeKeychain: createKeychainMock(false),
  platform: 'ios',
})

const adapters = {
  env: {},
  createLogger,
  legacyPrivToPub: {},
  storage: createUnlockableStorage(secureStorage),
  unsafeStorage,
  seedStorage,
  migrateableStorage: createUnlockableStorage(secureStorage),
  fetch: fetch.bind(window),
  freeze: Object.freeze,
  assetPlugins,
  customTokensStorage: storageRoot.namespace('customTokens'),
  iconsStorage: createIconsStorageModule({ storage: storageRoot }),
  getBuildMetadata,
  synchronizedTime: SynchronizedTime,
  port: new Emitter(),
  keystore,
}

export type Adapters = typeof adapters

export default adapters
