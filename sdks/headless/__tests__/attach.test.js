import { getSodiumKeysFromSeed } from '@exodus/crypto/sodium-compat'
import { EXODUS_KEY_IDS } from '@exodus/key-ids'
import { safeString } from '@exodus/safe-string'

import attachMigrations from '../src/migrations/attach.js'
import createAdapters from './adapters/index.js'
import ApplicationMock from './application/index.js'

const unlockEncryptedStorage = jest
  .fn()
  .mockImplementation((encryptedStorage) =>
    encryptedStorage.unlock({ encrypt: (data) => data, decrypt: (data) => data })
  )

const bytes = Buffer.from('9b438ad44f1c770e29588e476d57b5901e1f7a738f329ef30b6d4792c6674d50', 'hex')
const migrateableFusion = { load: jest.fn() }
const analytics = { track: jest.fn() }
const errorTracking = { track: jest.fn() }
const keychain = {
  sodium: {
    getKeysFromSeed: jest.fn().mockResolvedValue(getSodiumKeysFromSeed(bytes)),
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
    errorTracking,
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
    errorTracking.track.mockClear()

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

    expect(keychain.sodium.getKeysFromSeed).toHaveBeenCalledTimes(1)
    expect(keychain.sodium.getKeysFromSeed).toHaveBeenCalledWith({
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
    expect(errorTracking.track).toHaveBeenCalledTimes(1)

    const calls = analytics.track.mock.calls
    const errorCalls = errorTracking.track.mock.calls

    expect(calls[0][0].properties.success).toBe(false)
    expect(errorCalls[0][0]).toEqual({
      error: expect.objectContaining({
        message: 'oops',
      }),
      namespace: 'migrations',
      context: { migrationName: 'fail' },
    })
  })

  describe('timeout functionality', () => {
    beforeEach(() => {
      jest.clearAllMocks()
      jest.spyOn(console, 'log').mockImplementation(() => {})
      analytics.track.mockClear()
      errorTracking.track.mockClear()
    })

    test('should timeout individual migration when it exceeds maxDuration', async () => {
      application.reset()

      const slowMigration = {
        name: safeString`slow`,
        factory: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 200))
        }),
      }

      const config = { migrations: { maxDuration: 100 } }

      attachMigrations({
        migrations: [slowMigration],
        application,
        adapters,
        modules,
        config,
      })

      await application.fire('migrate')

      expect(slowMigration.factory).toHaveBeenCalledTimes(1)
      expect(analytics.track).toHaveBeenCalledTimes(1)
      expect(errorTracking.track).toHaveBeenCalledTimes(1)

      const calls = analytics.track.mock.calls
      const errorCalls = errorTracking.track.mock.calls
      expect(calls[0][0].properties.success).toBe(false)
      expect(errorCalls[0][0]).toEqual({
        error: expect.objectContaining({
          message: expect.stringContaining(slowMigration.name),
        }),
        namespace: 'migrations',
        context: { migrationName: 'slow' },
      })

      const flagsStorage = adapters.unsafeStorage.namespace('migrations')
      expect(await flagsStorage.get('slow')).toBe(undefined)
    })

    test('should use default maxDuration of 5000ms when not specified', async () => {
      application.reset()

      const migration = {
        name: 'test',
        factory: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }),
      }

      attachMigrations({
        migrations: [migration],
        application,
        adapters,
        modules,
      })

      await application.fire('migrate')

      expect(migration.factory).toHaveBeenCalledTimes(1)
      expect(analytics.track).toHaveBeenCalledTimes(1)

      const calls = analytics.track.mock.calls
      expect(calls[0][0].properties.success).toBe(true)

      const flagsStorage = adapters.unsafeStorage.namespace('migrations')
      expect(await flagsStorage.get('test')).toBe(true)
    })

    test('should timeout setup phase when it exceeds maxDuration', async () => {
      application.reset()

      const slowUnlockEncryptedStorage = jest.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 200))
      })

      const slowModules = { ...modules, unlockEncryptedStorage: slowUnlockEncryptedStorage }

      const migration1 = {
        name: 'migration1',
        factory: jest.fn(async () => {}),
      }

      const config = { migrations: { maxDuration: 100 } }

      await attachMigrations({
        migrations: [migration1],
        application,
        adapters,
        modules: slowModules,
        config,
      })

      await application.fire('migrate')
      expect(migration1.factory).toHaveBeenCalledTimes(0)
      expect(errorTracking.track).toHaveBeenCalledTimes(1)

      const errorCalls = errorTracking.track.mock.calls
      expect(errorCalls[0][0]).toEqual({
        error: expect.objectContaining({
          message: expect.stringContaining('timed out unlocking storage / fusion in migrations'),
        }),
        namespace: 'migrations',
        context: { phase: 'migration-hook' },
      })
    })

    test('should complete successfully when migrations finish within timeout', async () => {
      application.reset()

      const fastMigration1 = {
        name: 'fast1',
        factory: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }),
      }

      const fastMigration2 = {
        name: 'fast2',
        factory: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }),
      }

      const config = { migrations: { maxDuration: 100 } }

      attachMigrations({
        migrations: [fastMigration1, fastMigration2],
        application,
        adapters,
        modules,
        config,
      })

      await application.fire('migrate')

      expect(fastMigration1.factory).toHaveBeenCalledTimes(1)
      expect(fastMigration2.factory).toHaveBeenCalledTimes(1)
      expect(analytics.track).toHaveBeenCalledTimes(2)

      const calls = analytics.track.mock.calls
      expect(calls[0][0].properties.success).toBe(true)
      expect(calls[1][0].properties.success).toBe(true)

      const flagsStorage = adapters.unsafeStorage.namespace('migrations')
      expect(await flagsStorage.get('fast1')).toBe(true)
      expect(await flagsStorage.get('fast2')).toBe(true)
    })

    test('should provide correct timeout error message', async () => {
      application.reset()

      const slowMigration = {
        name: safeString`timeout-test`,
        factory: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 200))
        }),
      }

      const config = { migrations: { maxDuration: 100 } }

      attachMigrations({
        migrations: [slowMigration],
        application,
        adapters,
        modules,
        config,
      })

      const mockLogger = { log: jest.fn(), error: jest.fn() }
      adapters.createLogger = jest.fn().mockReturnValue(mockLogger)

      await application.fire('migrate')

      expect(mockLogger.error).toHaveBeenCalledWith(expect.stringContaining(slowMigration.name))
    })

    test('should handle partial migration completion when some migrations timeout', async () => {
      application.reset()

      const fastMigration = {
        name: 'fast',
        factory: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }),
      }

      const slowMigration = {
        name: safeString`slow`,
        factory: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 200))
        }),
      }

      const config = { migrations: { maxDuration: 100 } }

      attachMigrations({
        migrations: [fastMigration, slowMigration],
        application,
        adapters,
        modules,
        config,
      })

      await application.fire('migrate')

      expect(fastMigration.factory).toHaveBeenCalledTimes(1)
      expect(slowMigration.factory).toHaveBeenCalledTimes(1)
      expect(analytics.track).toHaveBeenCalledTimes(2)
      expect(errorTracking.track).toHaveBeenCalledTimes(1)

      const calls = analytics.track.mock.calls
      const errorCalls = errorTracking.track.mock.calls
      expect(calls[0][0].properties.success).toBe(true)
      expect(calls[1][0].properties.success).toBe(false)
      expect(errorCalls[0][0]).toEqual({
        error: expect.objectContaining({
          message: expect.stringContaining(slowMigration.name),
        }),
        namespace: 'migrations',
        context: { migrationName: 'slow' },
      })

      const flagsStorage = adapters.unsafeStorage.namespace('migrations')
      expect(await flagsStorage.get('fast')).toBe(true)
      expect(await flagsStorage.get('slow')).toBe(undefined)
    })

    test('should run migrations normally after setup phase completes', async () => {
      application.reset()

      const migration1 = {
        name: 'migration1',
        factory: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }),
      }

      const migration2 = {
        name: 'migration2',
        factory: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }),
      }

      const config = { migrations: { maxDuration: 200 } }

      attachMigrations({
        migrations: [migration1, migration2],
        application,
        adapters,
        modules,
        config,
      })

      await application.fire('migrate')

      expect(migration1.factory).toHaveBeenCalledTimes(1)
      expect(migration2.factory).toHaveBeenCalledTimes(1)
      expect(analytics.track).toHaveBeenCalledTimes(2)

      const calls = analytics.track.mock.calls
      expect(calls[0][0].properties.success).toBe(true)
      expect(calls[1][0].properties.success).toBe(true)

      const flagsStorage = adapters.unsafeStorage.namespace('migrations')
      expect(await flagsStorage.get('migration1')).toBe(true)
      expect(await flagsStorage.get('migration2')).toBe(true)
    })

    test('should still timeout individual migrations while setup phase succeeds', async () => {
      application.reset()

      const fastMigration = {
        name: 'fast',
        factory: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 10))
        }),
      }

      const slowMigration = {
        name: safeString`slow`,
        factory: jest.fn(async () => {
          await new Promise((resolve) => setTimeout(resolve, 200))
        }),
      }

      const config = { migrations: { maxDuration: 100 } }

      attachMigrations({
        migrations: [fastMigration, slowMigration],
        application,
        adapters,
        modules,
        config,
      })

      await application.fire('migrate')

      expect(fastMigration.factory).toHaveBeenCalledTimes(1)
      expect(slowMigration.factory).toHaveBeenCalledTimes(1)
      expect(analytics.track).toHaveBeenCalledTimes(2)
      expect(errorTracking.track).toHaveBeenCalledTimes(1)

      const calls = analytics.track.mock.calls
      const errorCalls = errorTracking.track.mock.calls
      expect(calls[0][0].properties.success).toBe(true)
      expect(calls[1][0].properties.success).toBe(false)
      expect(errorCalls[0][0]).toEqual({
        error: expect.objectContaining({
          message: expect.stringContaining(slowMigration.name),
        }),
        namespace: 'migrations',
        context: { migrationName: 'slow' },
      })

      const flagsStorage = adapters.unsafeStorage.namespace('migrations')
      expect(await flagsStorage.get('fast')).toBe(true)
      expect(await flagsStorage.get('slow')).toBe(undefined)
    })
  })
})
