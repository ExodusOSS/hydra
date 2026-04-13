import type { WalletAccount } from '@exodus/models'

type State = unknown

export type WalletAccountsSelectors = {
  data: (state: State) => Record<string, WalletAccount>
  configuredActiveWalletAccount: (state: State) => string | null
  loaded: (state: State) => boolean
  multipleWalletAccountsEnabled: (state: State) => boolean | undefined
  active: (state: State) => string
  activeIsCustodial: (state: State) => boolean
  activeNonCustodial: (state: State) => string
  all: (state: State) => WalletAccount[]
  allNonCustodial: (state: State) => string[]
  createLightning: (operation: string) => (state: State) => string[]
  createProperNameSelector: (
    name: string,
    opts?: { maxLength?: number }
  ) => (state: State) => string | null
  enabled: (state: State) => string[]
  filter: (condition?: Record<string, boolean>) => (state: State) => WalletAccount[]
  find: (condition?: Record<string, boolean>) => (state: State) => WalletAccount | undefined
  get: (state: State) => (name: string) => WalletAccount | undefined
  getExportPathName: (state: State) => (walletAccount: string) => string
  getMemoized: (name: string) => (state: State) => WalletAccount | undefined
  getPathFriendlyName: (
    state: State
  ) => (walletAccount: string, opts?: { maxLength?: number }) => string
  getProperName: (state: State) => (name: string, opts?: { maxLength?: number }) => string | null
  hardware: (state: State) => string[]
  hasMaxAmountOfAccounts: (state: State) => boolean
  hasMaxAmountOfLedgerAccounts: (state: State) => boolean
  hasMaxAmountOfTrezorAccounts: (state: State) => boolean
  hasMultipleWalletAccountsEnabledSelector: (state: State) => boolean
  isCustodial: (state: State) => (name: string) => boolean
  isFTX: (state: State) => (name: string) => boolean
  isLedger: (state: State) => (name: string) => boolean
  isLedgerActive: (state: State) => boolean
  isReadOnly: (state: State) => (name: string) => boolean
  isReadOnlyActive: (state: State) => boolean
  names: (state: State) => string[]
  nextIndex: (state: State) => number
}
