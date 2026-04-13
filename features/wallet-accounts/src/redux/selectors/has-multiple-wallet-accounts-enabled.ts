const hasMultipleWalletAccountsEnabledSelectorDefinition = {
  id: 'hasMultipleWalletAccountsEnabledSelector',
  resultFunction: (
    multipleWalletAccountsEnabled: boolean | undefined,
    enabledWalletAccounts: string[]
  ) => multipleWalletAccountsEnabled && enabledWalletAccounts.length > 1,
  dependencies: [
    //
    { selector: 'multipleWalletAccountsEnabled' },
    { selector: 'enabled' },
  ],
} as const

export default hasMultipleWalletAccountsEnabledSelectorDefinition
