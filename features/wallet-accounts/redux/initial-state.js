// eslint-disable-next-line @exodus/export-default/named
export default {
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
