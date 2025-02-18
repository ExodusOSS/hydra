import type { LifecycleHook } from '../constants/index.js'

// Helper types
export type ValueOf<T> = T[keyof T]
export type Nullable<T> = T | null
export type MaybePromise<T> = T | PromiseLike<T>

export type Alarms = {
  clear: (name: string) => Promise<void>
  create: (name: string, params: { delayInMinutes: number }) => Promise<void>
}

// TODO: Migrate wallet types to walet module when converting it to Typescript
export type WalletChangePassphraseParams = {
  currentPassphrase: string
  newPassphrase: string
}

export type CreateWalletParams = {
  mnemonic?: string
  passphrase?: string
}

export type UnlockWalletParams = {
  passphrase: string
}

export type Wallet = {
  create: (opts?: CreateWalletParams) => Promise<string>
  import: (opts: CreateWalletParams) => Promise<string>
  addSeed: (opts: AddSeedParams) => Promise<string>
  removeManySeeds: (seedIds: string[]) => Promise<void>
  removeSeed: (seedId: string) => Promise<void>
  getMnemonic: (opts: WalletGetMnemonicParams) => Promise<string>
  lock: () => Promise<void>
  unlock: (opts?: UnlockWalletParams) => Promise<void>
  isLocked: () => Promise<boolean>
  hasPassphraseSet: () => Promise<boolean>
  clear: () => Promise<void>
  exists: () => Promise<boolean>
  changePassphrase: (opts: WalletChangePassphraseParams) => Promise<void>
}

export type AddSeedParams = {
  mnemonic: string
  compatibilityMode?: string | null
}

export type WalletGetMnemonicParams = {
  passphrase?: string
}

// Application types

export type CreateApplicationParams = CreateWalletParams
export type LifecycleHookName = ValueOf<typeof LifecycleHook>
export type LifecycleHookListener = (...params: unknown[]) => MaybePromise<unknown>

type BackupType = 'passkeys' | 'seed-phrase'

export type StartApplicationParams = {
  /** Allows manually setting the restoring flag which will be propagated to lifecycle hooks. Use with caution, this is normally set automatically by the corresponding application methods */
  restoring?: boolean
}

export type ImportApplicationParams = CreateWalletParams & {
  forceRestart?: boolean
  forgotPassphrase?: boolean
  compatibilityMode?: boolean
  backupType?: BackupType
}

export type DeleteApplicationParams = {
  forgotPassphrase?: boolean
  restartOptions?: never[]
}

export type LockHistoryEntry = {
  locked: boolean
  timestamp: Date
}
