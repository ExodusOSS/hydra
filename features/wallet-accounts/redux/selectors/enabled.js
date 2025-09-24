const DEFAULT_ENABLED = Object.freeze([])

const resultFunction = (walletAccounts, get, multipleWalletAccountsEnabled) =>
  multipleWalletAccountsEnabled
    ? walletAccounts.filter((walletAccount) => get(walletAccount).enabled)
    : DEFAULT_ENABLED

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'enabled',
  resultFunction,
  dependencies: [
    //
    { selector: 'names' },
    { selector: 'get' },
    { selector: 'multipleWalletAccountsEnabled' },
  ],
}
