import type { Atom, ReadonlyAtom } from '@exodus/atoms'
import type { WalletAccount } from '@exodus/models'
import type { Storage } from '@exodus/storage-interface'

export type WalletAccountMap = Record<string, WalletAccount>
export type HardwareWalletPublicKeys = Record<string, Record<string, string>>

export type WalletAccountsAtom = ReadonlyAtom<WalletAccountMap>
export type WalletAccountsInternalAtom = Atom<WalletAccountMap | undefined>
export type ActiveWalletAccountAtom = Atom<string>
export type MultipleWalletAccountsEnabledAtom = Atom<boolean | undefined>
export type ExternalWalletAddresses = Record<string, Record<string, string>>
export type HardwareWalletPublicKeysAtom = Atom<HardwareWalletPublicKeys>
export type ExternalWalletAddressesAtom = Atom<ExternalWalletAddresses>
export type EnabledWalletAccountsAtom = ReadonlyAtom<WalletAccountMap>

export type WalletAccountsData = Partial<{
  id: string
  seedId: string
  compatibilityMode: string
  source: string
  index: number
  label: string
  enabled: boolean
  delegated: boolean
}>

export type UpdateableData = Omit<
  WalletAccountsData,
  'id' | 'seedId' | 'index' | 'compatibilityMode' | 'delegated'
>

export interface Wallet {
  getPrimarySeedId(): Promise<string>
}

export interface AllWalletAccountsEver {
  grantChannelAccess(params: { tail: () => Promise<unknown[]> }): void
  get(): Promise<Record<string, WalletAccount>>
}

export interface Fusion {
  mergeProfile(data: object): Promise<void>
  getProfile(options?: { online?: boolean }): Promise<Record<string, boolean | undefined>>
  subscribe(listener: (profile: Record<string, boolean | undefined>) => void): void
}

export interface Port {
  emit(event: string, value: unknown): void
}

export interface ErrorTracking {
  track(params: { error: unknown; namespace: string }): void
}

export interface StorageAdapters {
  storage: Storage
  unsafeStorage: Storage
}
