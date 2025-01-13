const hasMultipleWalletAccountsEnabledSelectorDefinition = {
  id: 'hasMultipleWalletAccountsEnabledSelector',
  resultFunction: (multipleWalletAccountsEnabled, enabledWalletAccounts) =>
    multipleWalletAccountsEnabled && enabledWalletAccounts.length > 1,
  dependencies: [
    //
    { selector: 'multipleWalletAccountsEnabled' },
    { selector: 'enabled' },
  ],
}

export default hasMultipleWalletAccountsEnabledSelectorDefinition
