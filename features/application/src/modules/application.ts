import type { Storage } from '@exodus/storage-interface'
import EventEmitter from 'events/events.js'
import assert from 'minimalistic-assert'
import proxyFreeze from 'proxy-freeze'

import { LifecycleHook as Hook } from '../constants/index.js'
import type {
  CreateApplicationParams,
  DeleteApplicationParams,
  LifecycleHookName,
  LifecycleHookListener,
  ValueOf,
  Wallet,
  WalletChangePassphraseParams,
  ImportApplicationParams,
  WalletGetMnemonicParams,
  UnlockWalletParams,
  AddSeedParams,
  StartApplicationParams,
} from '../utils/types.js'
import type { Atom } from '@exodus/atoms'
import type { Logger } from '@exodus/logger'
import type { Definition } from '@exodus/dependency-types'
import type { PassphraseCache } from '../modules/passphrase-cache.js'

// Because we are forced to restart wallet after deleting/importing, we need to store certain flags to persist state between executions

// Triggers deletetion logic when wallet starts.
// Set as true on delete method is called, and set to false when wallet is restarted
const DELETE_FLAG = 'deleteFlag'

// Triggers import logic when wallet starts. Used when overwriting existing wallet (not importing one from scratch)
// Set as true on import method is called, and set to false when wallet is restarted
const IMPORT_FLAG = 'importFlag'

// Triggers restore logic. We need to do it after any import, no matter if there was a previous wallet or not
// Set as true on import method is called, and set to false after restore is completed
const RESTORE_FLAG = 'restoreFlag'

const HOOKS = new Set(Object.values(Hook))

const MODULE_ID = 'application'

type HookFn = () => Promise<void>

type ErrorTrackingModule = {
  track: (params: { error: Error; context: any; namespace: string }) => Promise<void>
}

const passphraseCachePlaceholder = {
  changeTtl: () => Promise.resolve(),
  clear: () => Promise.resolve(),
  scheduleClear: () => Promise.resolve(),
  get: () => Promise.resolve(''),
  set: () => Promise.resolve(),
} as unknown as PassphraseCache

export type ApplicationParams = {
  wallet: Wallet
  unsafeStorage: Storage<boolean>
  lockedAtom: Atom<boolean>
  backedUpAtom: Atom<boolean>
  passphraseCache: PassphraseCache
  logger: Logger
  errorTracking: ErrorTrackingModule
}

export class Application extends EventEmitter {
  #hooks: Partial<Record<LifecycleHookName, LifecycleHookListener[]>> = {}
  #logger: Logger
  #wallet: Wallet
  #lockedAtom: Atom<boolean>
  #backedUpAtom: Atom<boolean>
  #passphraseCache: PassphraseCache
  #applicationStarted: Promise<void>
  #resolveStart: () => void = () => Promise.resolve()
  #flagsStorage: Storage<boolean>
  #storage: Storage
  #errorTracking: ErrorTrackingModule

  constructor({
    wallet,
    unsafeStorage,
    lockedAtom,
    backedUpAtom,
    passphraseCache = passphraseCachePlaceholder,
    logger,
    errorTracking,
  }: ApplicationParams) {
    super()

    this.#logger = logger
    this.#wallet = wallet
    this.#lockedAtom = lockedAtom
    this.#backedUpAtom = backedUpAtom
    this.#passphraseCache = passphraseCache
    this.#flagsStorage = unsafeStorage.namespace('flags')
    this.#storage = unsafeStorage.namespace('application')
    this.#errorTracking = errorTracking

    this.#applicationStarted = new Promise((resolve) => (this.#resolveStart = resolve))
    super.setMaxListeners(Number.POSITIVE_INFINITY)
  }

  emit = (name: string, ...args: any) => {
    const isFreezable = (val: any) => val && typeof val === 'object'
    return super.emit(name, ...args.map((arg: any) => (isFreezable(arg) ? proxyFreeze(arg) : arg)))
  }

  start = async ({ restoring }: StartApplicationParams = {}) => {
    const [deleteFlag, importFlag] = await this.#flagsStorage.batchGet([DELETE_FLAG, IMPORT_FLAG])

    if (restoring) {
      await this.#flagsStorage.set(RESTORE_FLAG, true)
    }

    const isDeleting = !!deleteFlag
    const isImporting = !!importFlag

    if (isDeleting) await this.#wallet.clear()

    if (isDeleting || isImporting) {
      await this.#flagsStorage.batchDelete([DELETE_FLAG, IMPORT_FLAG])
      await this.#passphraseCache.clear()
    }

    const walletExists = await this.#wallet.exists()

    if (isImporting || !walletExists) {
      await this.fire(Hook.Clear, null, { concurrent: true })
    }

    if (isImporting) {
      const params = await this.#storage.get('importParams')
      await this.fire(Hook.Import, params)
      await this.#storage.delete('importParams')
    }

    const [hasPassphraseSet, isLocked, isBackedUp, isRestoring] = await Promise.all([
      this.#wallet.hasPassphraseSet(),
      this.#wallet.isLocked(),
      this.isBackedUp(),
      this.isRestoring(),
    ])

    await this.fire(Hook.Start, {
      walletExists,
      hasPassphraseSet,
      isLocked,
      isBackedUp,
      isRestoring,
    })

    await this.#autoUnlock()

    const locked = await this.#wallet.isLocked()
    this.#logger.log('wallet is locked', locked)

    this.#resolveStart()
  }

  load = async () => {
    await this.#applicationStarted

    const [walletExists, hasPassphraseSet, isLocked, isBackedUp, isRestoring] = await Promise.all([
      this.#wallet.exists(),
      this.#wallet.hasPassphraseSet(),
      this.#wallet.isLocked(),
      this.isBackedUp(),
      this.isRestoring(),
    ])

    await this.fire(Hook.Load, {
      walletExists,
      hasPassphraseSet,
      isLocked,
      isBackedUp,
      isRestoring,
    })
  }

  unload = async () => {
    await this.#applicationStarted
    await this.#passphraseCache.scheduleClear()
    await this.fire(Hook.Unload)
  }

  hook = (hookName: LifecycleHookName, listener: LifecycleHookListener) => {
    assert(HOOKS.has(hookName), `no such hook: ${hookName}`)

    if (!this.#hooks[hookName]) {
      this.#hooks[hookName] = []
    }

    this.#hooks[hookName]!.push(listener)
  }

  private executeHooks = async (hooksFns: HookFn[], concurrent = false) => {
    if (concurrent) {
      return Promise.allSettled(hooksFns.map((fn) => fn()))
    }

    for (const hook of hooksFns) {
      await hook()
    }
  }

  fire = async (
    hookName: ValueOf<typeof Hook>,
    params?: unknown[] | unknown,
    { concurrent }: { concurrent?: boolean } = {}
  ) => {
    assert(HOOKS.has(hookName), `no such hook: ${hookName}`)

    this.#logger.debug(`firing hooks ${concurrent ? 'concurrently' : 'sequentially'}`, hookName)

    const hooks = this.#hooks[hookName] || []

    const hookFns = hooks.map((hook) => async () => {
      try {
        await hook(params)
      } catch (err) {
        this.#logger.error(`application lifecycle hook failed: ${hookName}`, hook.name, params, err)
        throw err
      }
    })

    await this.executeHooks(hookFns, concurrent)
    this.emit(hookName, params)
  }

  create = async (opts?: CreateApplicationParams) => {
    this.#logger.log('creating wallet')

    await this.#applicationStarted
    const seedId = await this.#wallet.create(opts)

    const isLocked = await this.#wallet.isLocked()

    await this.fire(Hook.Create, {
      hasPassphraseSet: !!opts?.passphrase,
      isBackedUp: false,
      isLocked,
      isRestoring: false,
      walletExists: true,
      seedId,
    })
  }

  import = async (opts: ImportApplicationParams) => {
    this.#logger.log('importing wallet')

    await this.#flagsStorage.set(RESTORE_FLAG, true)

    await this.#applicationStarted

    const walletExists = await this.#wallet.exists()

    const { forceRestart, compatibilityMode, backupType, ...wallet } = opts

    if (backupType) {
      await this.#storage.set('backupType', backupType)
    }

    const seedId = await this.#wallet.import(wallet)
    const importParams = { seedId, compatibilityMode, backupType }

    if (forceRestart || walletExists) {
      await this.#flagsStorage.set(IMPORT_FLAG, true)

      await this.#storage.set('importParams', importParams)
      await this.fire(Hook.Restart, { reason: 'import', backupType })
    } else {
      await this.fire(Hook.Import, importParams)

      this.#logger.log('wallet imported')
    }
  }

  addSeed = async (opts: AddSeedParams): Promise<string> => {
    this.#logger.log('adding seed to wallet')

    await this.#applicationStarted

    const { mnemonic, compatibilityMode } = opts
    const seedId = await this.#wallet.addSeed({ mnemonic, compatibilityMode })
    await this.fire(Hook.AddSeed, { seedId, compatibilityMode })

    // restore-progress-tracker#plugin subscribes to this event and defer the execution
    // of the next hook until the seed is fully restored.
    await this.fire(Hook.RestoreSeed, { seedId, compatibilityMode })

    this.fire(Hook.AssetsSynced).catch((e) => {
      this.#logger.warn('failed to execute onAssetsSynced hooks', e)
    })

    return seedId
  }

  removeManySeeds = (seedIds: string[]) => {
    return this.#wallet.removeManySeeds(seedIds)
  }

  removeSeed = (seedId: string) => {
    return this.#wallet.removeSeed(seedId)
  }

  getMnemonic = async (opts: WalletGetMnemonicParams) => this.#wallet.getMnemonic(opts)

  setBackedUp = async () => {
    await this.#backedUpAtom.set(true)
  }

  lock = async () => {
    this.#logger.log('locking')

    await this.#applicationStarted
    await this.#wallet.lock()
    await this.#lockedAtom.set(true)
    await this.#passphraseCache.clear()
    await this.fire(Hook.Lock)

    this.#logger.log('locked')
  }

  #restoreIfNeeded = async () => {
    try {
      const isRestoring = await this.isRestoring()

      if (isRestoring) {
        const backupType = await this.#storage.get('backupType')
        await this.fire(Hook.Restore, { backupType })
        await this.#flagsStorage.delete(RESTORE_FLAG)
        await this.fire(Hook.RestoreCompleted, { backupType })
        await this.#storage.delete('backupType')
      }

      this.fire(Hook.AssetsSynced).catch((e) => {
        this.#logger.warn('failed to execute onAssetsSynced hooks', e)
      })
    } catch (e: any) {
      this.#logger.error(e)
      this.#errorTracking
        .track({ error: e, namespace: 'application', context: 'restoreIfNeeded' })
        .catch((e) => this.#logger.error(e))
    }
  }

  #autoUnlock = async () => {
    const walletLocked = await this.#wallet.isLocked()
    const passphrase = await this.#passphraseCache.get()

    if (!walletLocked || !passphrase) return

    try {
      this.#logger.log('unlocking with cache')

      await this.#wallet.unlock({ passphrase })
      await this.#lockedAtom.set(false)

      await this.fire(Hook.Migrate)
      await this.fire(Hook.Unlock)

      void this.#restoreIfNeeded()
      this.#logger.log('unlocked with cache')
    } catch (err) {
      this.#logger.error('failed to unlock, outdated cached passphrase?', err)
    }
  }

  unlock = async (opts?: UnlockWalletParams) => {
    this.#logger.log('unlocking')

    await this.#applicationStarted
    await this.#wallet.unlock(opts)
    await this.#lockedAtom.set(false)

    await this.fire(Hook.Migrate)
    await this.fire(Hook.Unlock)

    void this.#restoreIfNeeded()

    if (opts?.passphrase) {
      void this.#passphraseCache.set(opts.passphrase)
    }

    this.#logger.log('unlocked')
  }

  changePassphrase = async (opts: WalletChangePassphraseParams) => {
    this.#logger.log('changing passphrase')

    const { currentPassphrase, newPassphrase } = opts
    await this.#applicationStarted
    await this.#wallet.changePassphrase({ currentPassphrase, newPassphrase })
    await this.#passphraseCache.set(newPassphrase)
    await this.fire(Hook.ChangePassphrase)

    this.#logger.log('passphrase changed')
  }

  delete = async (opts: DeleteApplicationParams = {}) => {
    const { forgotPassphrase, restartOptions } = opts
    await this.#flagsStorage.set(DELETE_FLAG, true)
    await this.#flagsStorage.delete(RESTORE_FLAG)
    await this.fire(Hook.Restart, { ...restartOptions, reason: 'delete', forgotPassphrase })
  }

  stop = async () => {
    await this.fire(Hook.Stop)
  }

  changeLockTimer = async ({ ttl }: { ttl: number }) => {
    return this.#passphraseCache.changeTtl(ttl)
  }

  restartAutoLockTimer = async () => {
    await this.#passphraseCache.scheduleClear()
  }

  isRestoring = async () => {
    return this.#flagsStorage.get(RESTORE_FLAG)
  }

  // TODO: stop emitting this on hooks?
  isBackedUp = async () => {
    return this.#backedUpAtom.get()
  }
}

const createApplicationModule = (args: ApplicationParams) => new Application({ ...args })

const applicationModuleDefinition = {
  id: MODULE_ID,
  type: 'module',
  factory: createApplicationModule,
  dependencies: [
    'wallet',
    'unsafeStorage',
    'lockedAtom',
    'backedUpAtom',
    'passphraseCache?',
    'logger',
    'errorTracking',
  ],
  public: true,
} as const satisfies Definition

export default applicationModuleDefinition
