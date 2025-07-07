import { EXODUS_KEY_IDS } from '@exodus/key-ids'
import { rejectAfter } from '../utils/promises.js'
import { safeString } from '@exodus/safe-string'

const attachMigrations = ({ migrations = [], application, modules, adapters, config, ...deps }) => {
  const { unsafeStorage, migrateableStorage } = adapters
  const { analytics, wallet, unlockEncryptedStorage, migrateableFusion, keychain, errorTracking } =
    modules
  // Override encrypted storage with migrations own instance to make sure no modules reads from it before migrations ran
  const maxDuration = config?.migrations?.maxDuration ?? 5000

  const migrationFlagsStorage = unsafeStorage.namespace('migrations')
  const migrationAdapters = { ...adapters, storage: migrateableStorage }
  const migrationModules = { ...modules, fusion: migrateableFusion }
  const logger = adapters.createLogger(`exodus:migrations`)
  const attachMigration = async (migration) => {
    const { name, factory } = migration
    const logger = adapters.createLogger(`exodus:migration:${name}`)

    logger.log('running migration')

    let success = false

    try {
      const start = performance.now()
      // `name` is a `safeString` here, that ensures it will be not omitted in Safe Reports when coerced to Safe Errors.
      // TODO: pass `name` into `safeString` with a more meaningful message once safeString supports passing in safeString variables.
      const timeout = rejectAfter(maxDuration, name)

      try {
        await Promise.race([
          factory({
            ...deps,
            config,
            adapters: migrationAdapters,
            modules: migrationModules,
            logger,
          }),
          timeout.promise,
        ])

        timeout.clear()

        const time = performance.now() - start

        logger.log(`migration successful in ${time.toFixed(2)}ms`)

        await migrationFlagsStorage.set(name, true)

        success = true
      } catch (error) {
        timeout.clear()
        throw error
      }
    } catch (error) {
      logger.error(`migration failed: ${error.stack}`)
      errorTracking.track({
        error,
        namespace: safeString`migrations`,
        context: { migrationName: name },
      })
    } finally {
      analytics?.track({
        event: 'ClientMigrationRun',
        properties: { migrationId: name, success },
        force: true,
      })
    }
  }

  application.hook('migrate', async () => {
    try {
      const setupTimeout = rejectAfter(
        maxDuration,
        safeString`timed out unlocking storage / fusion in migrations`
      )

      // Race the entire hook callback against timeout
      await Promise.race([
        (async () => {
          await unlockEncryptedStorage(migrateableStorage)

          const seedId = await wallet.getPrimarySeedId()
          const keys = await keychain.sodium.getKeysFromSeed({
            seedId,
            keyId: EXODUS_KEY_IDS.FUSION,
            exportPrivate: true,
          })

          await migrateableFusion.load({ keys })
        })(),
        setupTimeout.promise,
      ])

      setupTimeout.clear()

      const migrationNames = migrations.map((migration) => migration.name)
      const migrationFlags = await migrationFlagsStorage.batchGet(migrationNames)
      const migrationsDiff = migrations.filter((v, k) => !migrationFlags[k])

      for (const migration of migrationsDiff) {
        await attachMigration(migration)
      }
    } catch (error) {
      logger.error(`${error.stack}`)
      errorTracking.track({
        error,
        namespace: safeString`migrations`,
        context: { phase: 'migration-hook' },
      })
    }
  })

  application.hook('clear', async () => {
    await migrationFlagsStorage.clear()
  })
}

export default attachMigrations
