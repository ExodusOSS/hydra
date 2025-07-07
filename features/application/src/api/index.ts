import type { Application } from '../modules/application.js'
import type { Definition } from '@exodus/dependency-types'
import type { PassphraseCache } from '../modules/passphrase-cache.js'
import type { EventLog } from '../utils/types.js'

type FactoryParams = {
  application: Application
  eventLog: EventLog
  passphraseCache?: PassphraseCache
}

type RestoreFromCurrentPhraseParams = {
  passphrase?: string
}

export interface ApplicationApi {
  application: {
    /**
     * Kicks off the application lifecycle.
     * @example
     * ```typescript
     * await exodus.application.start()
     * ```
     */
    start: Application['start']

    /**
     * Attempts to gracefully shut down all application features.
     * @example
     * ```typescript
     * await exodus.application.stop()
     * ```
     */
    stop: Application['stop']

    /**
     * Loads the application.
     * @example
     * ```typescript
     * await exodus.application.load()
     * ```
     */
    load: Application['load']

    /**
     * Unloads the application
     * @example
     * ```typescript
     * await exodus.application.unload()
     * ```
     */
    unload: Application['unload']

    /**
     * Creates a new wallet.
     * @example
     * ```typescript
     * await exodus.application.create()
     * ```
     */
    create: Application['create']

    /**
     * Locks the wallet.
     * @example
     * ```typescript
     * await exodus.application.lock()
     * ```
     */
    lock: Application['lock']

    /**
     * Unlocks the wallet.
     * @remarks
     * After the wallet is unlocked, any pending migrations are executed.
     *@param opts - An object containing the passphrase to unlock the wallet
     * @example
     * ```typescript
     * await exodus.application.unlock({ passphrase: 'myPassphrase' })
     * ````
     */
    unlock: Application['unlock']

    /**
     * Imports an existing wallet.
     * @example
     * @params opts - An object containing the mnemonic and passphrase, along with a set
     * of optional flags.
     * ```typescript
     * await exodus.application.import({ mnemonic: 'myMnemonic', passphrase: 'myPassphrase' })
     * ```
     */
    import: Application['import']

    /**
     * Schedules a deletion of the current imported wallet, then restarts the application.
     * @example
     * ```typescript
     * await exodus.application.delete({ forgotPassphrase: true })
     * ```
     */
    delete: Application['delete']

    /**
     * Retrieves the current wallet mnemonic.
     * @deprecated - use `wallet.getMnemonic`instead
     * @see {@link [Wallet.getMnemonic](https://github.com/ExodusMovement/exodus-hydra/blob/d5ff6266ce9eb752533df52996d05a7c0bed1cee/features/wallet/module/wallet.js#L239-L248)}
     * @remarks
     * The wallet mnemonic contains a series of words that can be used to restore the wallet.
     * It should be trated as very sensitive data.
     * @param opts - An object containing an optional passphrase.
     * @example
     * ```typescript
     * const mnemonic = await exodus.application.getMnemonic()
     * ```
     */
    getMnemonic: Application['getMnemonic']

    /**
     * Set a flag indicating that the wallet has been backed up.
     * @example
     * ```typescript
     * await exodus.application.setBackedUp()
     * ```
     */
    setBackedUp: Application['setBackedUp']

    /**
     * Changes the passphrase of the wallet.
     * @param opts - An object containing the current and new passphrase.
     * @example
     * ```typescript
     * await exodus.application.changePassphrase({ currentPassphrase: 'myCurrentPassphrase', newPassphrase: 'myNewPassphrase' })
     * ```
     */
    changePassphrase: Application['changePassphrase']

    /**
     * Changes the auto lock timer TTL (time to live).
     * @remarks
     * This is used as part of the auto unlock functionality, the wallet will be considered locked after the timer expires.
     * @param opts - An object containing the `ttl` in milliseconds.
     * @example
     * ```typescript
     * await exodus.application.changeLockTimer({ lockTimer: 1000 })
     * ```
     */
    changeLockTimer: Application['changeLockTimer']

    /**
     * Changess the auto lock timer.
     * @remarks
     * This is used as part of the auto unlock functionality, the wallet will be considered locked after the timer expires.
     * @param opts - An object containing the `ttl` in milliseconds.
     * @example
     * ```typescript
     * await exodus.application.restartAutoLockTimer()
     * ```
     */
    restartAutoLockTimer: Application['restartAutoLockTimer']

    /**
     * Adds an extra seed to the wallet.
     * @remarks
     * After the new seed is added, the application starts the restore process.
     * @param opts - An object containing the mnemonic and compatibility mode.
     * @example
     * ```typescript
     * await exodus.application.addSeed({ mnemonic: 'myMnemonic', compatibilityMode: 'metamask' })
     * ```
     */
    addSeed: Application['addSeed']

    /**
     * Removes a seed by its id.
     * @param seedId - The id of the seed to be removed.
     * @example
     * ```typescript
     * await exodus.application.removeSeed('seedId')
     * ```
     */
    removeSeed: Application['removeSeed']

    /**
     * Restores the wallet from the current phrase.
     * @remarks
     * This is useful when you need to trigger a restore for the existing primary seed, without adding
     * it back again. In practical terms, it triggers an import event without adding the seed back.
     * @param opts - An object containing the passphrase, if the passphrase is not provided,
     * it will be fetched from the passphrase cache.
     * @example
     * ```typescript
     * await exodus.application.restoreFromCurrentPhrase() // will use the passphrase cache
     * ```
     */
    restoreFromCurrentPhrase: (params?: RestoreFromCurrentPhraseParams) => Promise<void>
  }
}

const factory = ({ application, eventLog, passphraseCache }: FactoryParams): ApplicationApi => {
  const restoreFromCurrentPhrase = async ({ passphrase }: RestoreFromCurrentPhraseParams = {}) => {
    await eventLog.record({ event: 'applicationApi.restoreFromCurrentPhrase' })

    if (!passphrase && passphraseCache) passphrase = await passphraseCache.get()
    const mnemonic = await application.getMnemonic({ passphrase })
    await application.import({ passphrase, mnemonic })
  }

  return {
    application: {
      start: application.start,
      stop: application.stop,
      load: application.load,
      unload: application.unload,
      create: application.create,
      lock: application.lock,
      unlock: application.unlock,
      import: application.import,
      delete: application.delete,
      getMnemonic: application.getMnemonic,
      setBackedUp: application.setBackedUp,
      changePassphrase: application.changePassphrase,
      changeLockTimer: application.changeLockTimer,
      restartAutoLockTimer: application.restartAutoLockTimer,
      addSeed: application.addSeed,
      removeSeed: application.removeSeed,
      restoreFromCurrentPhrase,
    },
  }
}

const applicationApiDefinition = {
  id: 'applicationApi',
  type: 'api',
  factory,
  dependencies: ['application', 'eventLog', 'passphraseCache?'],
} as const satisfies Definition

export default applicationApiDefinition
