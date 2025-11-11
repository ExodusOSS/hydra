const resultFunction = (walletAccounts, get, multipleWalletAccountsEnabled) => {
  const enabledAccounts = walletAccounts.filter((walletAccount) => get(walletAccount).enabled)

  return multipleWalletAccountsEnabled ? enabledAccounts : enabledAccounts.slice(0, 1)
}

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
