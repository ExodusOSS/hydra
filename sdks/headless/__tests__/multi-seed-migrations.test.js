import { fromMasterSeed } from '@exodus/bip32'
import { mnemonicToSeed } from '@exodus/bip39'
import createDeferringStorage from '@exodus/deferring-storage'
import { WalletAccount } from '@exodus/models'
import { TREZOR_SRC } from '@exodus/models/lib/wallet-account/index.js'
import createUnsafeStorage from '@exodus/storage-memory'
import multiSeedWalletAccountsMigration from '@exodus/wallet-accounts/migrations/multi-seed-wallet-accounts.js'

import createEncryptedStorage from './adapters/encrypted-storage.js'
import createAdapters from './adapters/index.js'
import createSeedStorage from './adapters/seed-storage.js'
import config from './config.js'
import createExodus from './exodus.js'

const createUnlockableStorage = (storage) => {
  const deferringStorage = createDeferringStorage(storage)
  return {
    ...deferringStorage,
    unlock: () => deferringStorage.release(),
  }
}

describe('multi-seed wallet accounts migration', async () => {
  const passphrase = 'my-password-manager-generated-this'
  const mnemonic = 'menu memory fury language physical wonder dog valid smart edge decrease worth'
  const seed = await mnemonicToSeed({ mnemonic })
  const seedId = fromMasterSeed(seed).identifier.toString('hex')

  const setup = async ({ storedWalletAccounts, compatibilityMode, fixture, extraConfig } = {}) => {
    const unsafeStorage = createUnsafeStorage({ skipValueValidation: true })
    const seedStorage = createSeedStorage()

    const fixtures = {
      encrypted: {
        createStorages: () => ({
          storage: createEncryptedStorage(unsafeStorage),
          migrateableStorage: createEncryptedStorage(unsafeStorage),
          walletSdkOverrides: {
            seedStorage,
            storage: createEncryptedStorage(unsafeStorage),
          },
        }),
      },
      unencrypted: {
        createStorages: () => {
          const storage = createUnlockableStorage(unsafeStorage)

          return {
            storage,
            migrateableStorage: createUnlockableStorage(unsafeStorage),
            walletSdkOverrides: {
              seedStorage,
              storage: createUnlockableStorage(storage),
            },
          }
        },
      },
    }

    const { createStorages } = fixtures[fixture]

    let adapters = createAdapters({
      channelData: {}, // so that the fusion down sync doesn't update the seed id
      unsafeStorage,
      seedStorage,
      ...createStorages(),
    })

    const container = createExodus({
      adapters,
      config: { ...config, wallet: { compatibilityModes: [] }, ...extraConfig },
    })

    container.register({
      definition: {
        id: 'migrations',
        type: 'migrations',
        factory: () => [],
        dependencies: [],
        override: true,
        public: true,
      },
    })

    let exodus = container.resolve()

    /**
     * Start the wallet, and import the passphrase (clears all storage).
     * We then stop the wallet, and make our storage changes.
     */
    await exodus.application.start()
    await exodus.application.import({ mnemonic, passphrase })
    await exodus.application.unlock({ passphrase })
    await exodus.application.stop()

    if (compatibilityMode) {
      await adapters.unsafeStorage.namespace('flags').set('compatibilityMode', compatibilityMode)
    }

    if (storedWalletAccounts) {
      // The `storedWalletAccounts` value for the "encrypted" fixture is actually an encrypted blob of data
      // so we can directly use the unsafeStorage and write the value (little hack)
      await adapters.unsafeStorage
        .namespace('walletAccounts')
        .set('walletAccounts', storedWalletAccounts)
        .then(() => console.log('storage has changed'))
    }

    // Call createStorages again to reset the adapter state
    // e.g ensure storages are locked again.
    adapters = createAdapters({
      channelData: {}, // so that the fusion down sync doesn't update the seed id
      unsafeStorage,
      seedStorage,
      ...createStorages(),
    })

    const container2 = createExodus({
      adapters,
      config: { ...config, wallet: { compatibilityModes: [] } },
    })

    container2.register({
      definition: {
        id: 'migrations',
        type: 'migrations',
        factory: () => [multiSeedWalletAccountsMigration],
        dependencies: [],
        override: true,
        public: true,
      },
    })

    exodus = container2.resolve()
    await exodus.application.start()
    await exodus.application.unlock({ passphrase })

    return { exodus, adapters }
  }

  // Encrypted fixtures have old colors, so the `color: fixture === 'encrypted' ? '...' : undefined,` hack below in tests
  // See https://github.com/ExodusMovement/exodus-core/pull/1269
  const fixtures = {
    encrypted: {
      // These are encrypted blobs containing the data from below.
      softwareWalletAccounts:
        'ScAVaT9/jwoMro0RiRmox/s03be3TxxuLQ41luze9rI5IEaxCz3GlN90RIGTmLRb01TE/KoZl3m4yDpkVaY56YHq8ocE0a6FwLymcgsIJh2cgMMWgu5hyDM1wSe2P4Od0dq6QAUhnds2PjXqs/1G8lZv1n0QtwYO8AHwu8ZoXG/5SHhL4zi1mOlxzuAhjMznu6gOLeuNuZGEgwM1hlK8NsVjLh5oXqH9bW/LUXsCS7yFcZyK9erpMmCBCBlAsfGHnreLMPz7EZbVuRDJAclCNICXZLr0dPTndN4+Y8RCoAQDhBnwgfxI0hY7NBXWBe8n25cnPgvmyAHPMufnN/rR',
      softwareAndHardwareWalletAccount:
        '6smW0iU61lQHULQRQyVYD3SwJOmUSCGtiwAEmkStrmQ3a3nnbIu4MW83ASPTMAl1gLwZXZP/+/yv/vSXMXHdv0aWV3ZlUf3AepXQAgVUea0a0c+wI6T+w0dxNXKFDvQYCod8z3Vdt8uCOBHkXZKiqG8oCHzwcXSVgOk71ttZc0V32tVHyHOcVmjiY98K8VKtkXNkUJWawEHItXROBpJPI7fKa5pINjK7rx0ABNXAbNPKBPouXuUUgjVeYBqrrgoDBA2r3mZ2uwa9HGvK1qnOC1EhFjiE2SMYc5PHJOesUWY8Ihq8zq/7c9XCHkiMMyPTeaDCEajbmA7M9rbxGckFHhts5Hqel8AS8mySvOQu',
    },
    unencrypted: {
      softwareWalletAccounts: {
        [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
        exodus_1: new WalletAccount({ ...WalletAccount.DEFAULT, index: 1 }),
      },
      softwareAndHardwareWalletAccount: {
        [WalletAccount.DEFAULT_NAME]: WalletAccount.DEFAULT,
        trezor_0_abc: new WalletAccount({ source: TREZOR_SRC, index: 0, id: 'abc' }),
      },
    },
  }

  describe.each([
    ['platforms with encrypted storage', 'encrypted'],
    ['platforms without encrypted storage', 'unencrypted'],
  ])('%s', (_, fixture) => {
    test('migrates default wallet account', async () => {
      const { exodus } = await setup({ fixture })

      await expect(exodus.walletAccounts.getEnabled()).resolves.toEqual({
        [WalletAccount.DEFAULT_NAME]: new WalletAccount({
          ...WalletAccount.DEFAULT,
          seedId,
        }),
      })

      await exodus.application.stop()
    })

    test('migrates stored wallet accounts', async () => {
      // default wallet account and another wallet account at index 1 without seedId
      const { softwareWalletAccounts: stored } = fixtures[fixture]
      const { exodus } = await setup({ storedWalletAccounts: stored, fixture })

      await expect(exodus.walletAccounts.getEnabled()).resolves.toEqual({
        [WalletAccount.DEFAULT_NAME]: new WalletAccount({
          ...WalletAccount.DEFAULT,
          seedId,
          color: fixture === 'encrypted' ? '#ff3974' : undefined,
        }),
        exodus_1: new WalletAccount({
          ...WalletAccount.DEFAULT,
          index: 1,
          seedId,
          color: fixture === 'encrypted' ? '#ff3974' : undefined,
        }),
      })

      await exodus.application.stop()
    })

    test('does not add seed id to hardware account', async () => {
      // default wallet account and a trezor account
      const { softwareAndHardwareWalletAccount: stored } = fixtures[fixture]
      const { exodus } = await setup({ storedWalletAccounts: stored, fixture })

      await expect(exodus.walletAccounts.getEnabled()).resolves.toEqual({
        [WalletAccount.DEFAULT_NAME]: new WalletAccount({
          ...WalletAccount.DEFAULT,
          seedId,
          color: fixture === 'encrypted' ? '#ff3974' : undefined,
        }),
        trezor_0_abc: new WalletAccount({
          source: WalletAccount.TREZOR_SRC,
          id: 'abc',
          index: 0,
          color: fixture === 'encrypted' ? '#7b39ff' : undefined,
        }),
      })

      await exodus.application.stop()
    })

    test('adds compatibility mode', async () => {
      const compatibilityMode = 'metamask'
      const { softwareAndHardwareWalletAccount: stored } = fixtures[fixture]
      const { exodus, adapters } = await setup({
        storedWalletAccounts: stored,
        compatibilityMode,
        fixture,
      })

      await expect(exodus.walletAccounts.getEnabled()).resolves.toEqual({
        [WalletAccount.DEFAULT_NAME]: new WalletAccount({
          ...WalletAccount.DEFAULT,
          compatibilityMode,
          seedId,
          color: fixture === 'encrypted' ? '#ff3974' : undefined,
        }),
        trezor_0_abc: new WalletAccount({
          source: WalletAccount.TREZOR_SRC,
          id: 'abc',
          index: 0,
          color: fixture === 'encrypted' ? '#7b39ff' : undefined,
        }),
      })

      await expect(
        adapters.unsafeStorage.namespace('flags').get('compatibilityMode')
      ).resolves.toBeUndefined()

      await exodus.application.stop()
    })

    test('adds default label for empty state', async () => {
      const { exodus, adapters } = await setup({
        storedWalletAccounts: null,
        fixture,
        extraConfig: {
          walletAccountsInternalAtom: {
            defaultLabel: 'test',
          },
        },
      })

      await expect(exodus.walletAccounts.getEnabled()).resolves.toEqual({
        [WalletAccount.DEFAULT_NAME]: new WalletAccount({
          ...WalletAccount.DEFAULT,
          label: 'test',
          seedId,
        }),
      })

      await expect(
        adapters.unsafeStorage.namespace('flags').get('compatibilityMode')
      ).resolves.toBeUndefined()

      await exodus.application.stop()
    })
  })
})
