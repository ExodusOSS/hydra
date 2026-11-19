import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'

const hasMultipleWalletAccountsEnabledSelectorDefinition = defineSelectorResultFunction({
  id: 'hasMultipleWalletAccountsEnabledSelector',
  resultFunction: (
    multipleWalletAccountsEnabled: boolean | undefined,
    enabledWalletAccounts: string[]
  ): boolean | undefined => multipleWalletAccountsEnabled && enabledWalletAccounts.length > 1,
  dependencies: [
    //
    { selector: 'multipleWalletAccountsEnabled' },
    { selector: 'enabled' },
  ],
})

export default hasMultipleWalletAccountsEnabledSelectorDefinition
