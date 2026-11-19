import type { WalletAccount } from '@exodus/models'

const initialState: WalletAccountsReduxState = {
  error: null,
  configuredActiveWalletAccountLoaded: false,
  multipleWalletAccountsEnabledLoaded: false,
  walletAccountsDataLoaded: false,
  loaded: false,
  // flag while replacing all data with data in fusion
  data: Object.create(null),
  multipleWalletAccountsEnabled: undefined, // important to distinguish "not changed by user" state
  // prefix to avoid confusion with selector
  configuredActiveWalletAccount: null,
}

export type WalletAccountsReduxState = {
  error: string | null
  configuredActiveWalletAccountLoaded: boolean
  multipleWalletAccountsEnabledLoaded: boolean
  walletAccountsDataLoaded: boolean
  loaded: boolean
  data: Record<string, WalletAccount>
  multipleWalletAccountsEnabled: boolean | undefined
  configuredActiveWalletAccount: string | null
}

export default initialState
