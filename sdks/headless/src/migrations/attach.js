import { rejectAfter } from '../utils/promises.js'
import { safeString } from '@exodus/safe-string'

const attachMigrations = ({ migrations = [], application, modules, adapters, config, ...deps }) => {
  const { unsafeStorage, migrateableStorage } = adapters
  const { analytics, unlockEncryptedStorage, migrateableFusion, errorTracking } = modules
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
      if (typeof migrateableStorage.unlock === 'function') {
        await unlockEncryptedStorage(migrateableStorage)
      }

      void migrateableFusion.load().catch((error) => {
        logger.error(`fusion.load() failed during migrate hook: ${error.stack}`)
        errorTracking.track({
          error,
          namespace: safeString`migrations`,
          context: { phase: 'migration-hook:fusion-load' },
        })
      })

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
