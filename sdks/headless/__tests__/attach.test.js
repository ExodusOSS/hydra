import { EXODUS_KEY_IDS } from '@exodus/key-ids'
import sodium from '@exodus/sodium-crypto'

import attachMigrations from '../src/migrations/attach'
import createAdapters from './adapters'
import ApplicationMock from './application'

const unlockEncryptedStorage = jest
  .fn()
  .mockImplementation((encryptedStorage) =>
    encryptedStorage.unlock({ encrypt: (data) => data, decrypt: (data) => data })
  )

const bytes = Buffer.from('9b438ad44f1c770e29588e476d57b5901e1f7a738f329ef30b6d4792c6674d50', 'hex')
const migrateableFusion = { load: jest.fn() }
const analytics = { track: jest.fn() }
const keychain = {
  sodium: {
    getSodiumKeysFromSeed: jest.fn().mockResolvedValue(sodium.getSodiumKeysFromSeed(bytes)),
  },
}

describe('attach', () => {
  const adapters = createAdapters()
  const modules = {
    analytics,
    unlockEncryptedStorage,
    wallet: { getPrimarySeedId: jest.fn().mockResolvedValue('primarySeedId') },
    keychain,
    migrateableFusion,
  }
  const application = new ApplicationMock()
  const flagsStorage = adapters.unsafeStorage.namespace('migrations')

  let migration1, migration2, migrations

  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation(() => {})

    migration1 = { name: 'migration1', factory: jest.fn(async () => {}) }
    migration2 = { name: 'migration2', factory: jest.fn(async () => {}) }

    migrations = [migration1, migration2]

    analytics.track.mockClear()

    attachMigrations({ migrations, application, adapters, modules })
  })

  afterEach(async () => {
    await adapters.unsafeStorage.clear()
    application.reset()
  })

  test('calls load on migrateableFusion', async () => {
    expect(migrateableFusion.load).toHaveBeenCalledTimes(0)

    await application.fire('migrate')

    expect(migrateableFusion.load).toHaveBeenCalledTimes(1)
    expect(migrateableFusion.load).toHaveBeenCalledWith({ keys: expect.any(Object) })
  })

  test('provide correct params to keychain when retrieving keys', async () => {
    expect(migrateableFusion.load).toHaveBeenCalledTimes(0)

    await application.fire('migrate')

    expect(keychain.sodium.getSodiumKeysFromSeed).toHaveBeenCalledTimes(1)
    expect(keychain.sodium.getSodiumKeysFromSeed).toHaveBeenCalledWith({
      seedId: 'primarySeedId',
      keyId: EXODUS_KEY_IDS.FUSION,
      exportPrivate: true,
    })
  })

  test('should call migrations after migrate hook', async () => {
    expect(migration1.factory).toHaveBeenCalledTimes(0)
    expect(migration2.factory).toHaveBeenCalledTimes(0)

    await application.fire('migrate')

    expect(migration1.factory).toHaveBeenCalledTimes(1)
    expect(migration2.factory).toHaveBeenCalledTimes(1)
  })

  test('should store migration flags after run', async () => {
    expect(await flagsStorage.get('migration1')).toBe(undefined)
    expect(await flagsStorage.get('migration2')).toBe(undefined)

    await application.fire('migrate')

    expect(await flagsStorage.get('migration1')).toBe(true)
    expect(await flagsStorage.get('migration2')).toBe(true)
  })

  test('should not call migrations if already ran', async () => {
    await flagsStorage.set('migration1', true)
    await flagsStorage.set('migration2', true)

    await application.fire('migrate')

    expect(migration1.factory).toHaveBeenCalledTimes(0)
    expect(migration2.factory).toHaveBeenCalledTimes(0)
  })

  test('should have access to encrypted storage', (done) => {
    const factory = async ({ adapters }) => {
      const { storage } = adapters

      expect(unlockEncryptedStorage).toHaveBeenCalled()

      const value = await storage.get('test')

      expect(value).toBe(undefined)

      done()
    }

    const migrations = [{ name: 'encrypted', factory }]

    attachMigrations({ migrations, application, adapters, modules })

    application.fire('migrate')
  })

  test('should clear migration flags on clear hook', async () => {
    await application.fire('migrate')
    await application.fire('clear')

    expect(await flagsStorage.get('migration1')).toBe(undefined)
    expect(await flagsStorage.get('migration2')).toBe(undefined)
  })

  test('should track success event if migration finished', async () => {
    await application.fire('migrate')

    expect(analytics.track).toHaveBeenCalledTimes(2)

    const calls = analytics.track.mock.calls

    expect(calls[0][0].properties.success).toBe(true)
    expect(calls[1][0].properties.success).toBe(true)
  })

  test('should track unsuccess event if migration fails', async () => {
    application.reset()

    const migrations = [
      {
        name: 'fail',
        factory: () => {
          throw new Error('oops')
        },
      },
    ]

    attachMigrations({ migrations, application, adapters, modules })

    await application.fire('migrate')

    expect(analytics.track).toHaveBeenCalledTimes(1)

    const calls = analytics.track.mock.calls

    expect(calls[0][0].properties.success).toBe(false)
  })
})
