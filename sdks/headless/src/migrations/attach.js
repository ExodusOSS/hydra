import { EXODUS_KEY_IDS } from '@exodus/key-ids'

const attachMigrations = ({ migrations = [], application, modules, adapters, config, ...deps }) => {
  const { unsafeStorage, migrateableStorage } = adapters
  const { analytics, wallet, unlockEncryptedStorage, migrateableFusion, keychain } = modules

  // Override encrypted storage with migrations own instance to make sure no modules reads from it before migrations ran
  const migrationFlagsStorage = unsafeStorage.namespace('migrations')
  const migrationAdapters = { ...adapters, storage: migrateableStorage }
  const migrationModules = { ...modules, fusion: migrateableFusion }

  const attachMigration = async (migration) => {
    const { name, factory } = migration
    const logger = adapters.createLogger(`exodus:migration:${name}`)

    logger.log('running migration')

    let success = false

    try {
      const start = performance.now()

      await factory({
        ...deps,
        config,
        adapters: migrationAdapters,
        modules: migrationModules,
        logger,
      })

      const time = performance.now() - start

      logger.log(`migration successful in ${time.toFixed(2)}ms`)

      await migrationFlagsStorage.set(name, true)

      success = true
    } catch (error) {
      logger.log(`migration failed: ${error.stack}`)
    } finally {
      analytics?.track({
        event: 'ClientMigrationRun',
        properties: { migrationId: name, success },
        force: true,
      })
    }
  }

  application.hook('migrate', async () => {
    await unlockEncryptedStorage(migrateableStorage)

    const seedId = await wallet.getPrimarySeedId()
    const keys = await keychain.sodium.getSodiumKeysFromSeed({
      seedId,
      keyId: EXODUS_KEY_IDS.FUSION,
      exportPrivate: true,
    })
    await migrateableFusion.load({ keys })

    const migrationNames = migrations.map((migration) => migration.name)
    const migrationFlags = await migrationFlagsStorage.batchGet(migrationNames)
    const migrationsDiff = migrations.filter((v, k) => !migrationFlags[k])

    for (const migration of migrationsDiff) {
      await attachMigration(migration)
    }
  })

  application.hook('clear', async () => {
    await migrationFlagsStorage.clear()
  })
}

export default attachMigrations
