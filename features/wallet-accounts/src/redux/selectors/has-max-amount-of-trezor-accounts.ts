import { createSelector } from 'reselect'
import type { WalletAccountsSelectors } from '../types.js'

const hasMaxAmountOfTrezorAccountsSelectorFactory =
  ({ maxAmountOfAccounts = 3 }: { maxAmountOfAccounts?: number }) =>
  (filter: WalletAccountsSelectors['filter']) =>
    createSelector(
      filter({ enabled: true, trezor: true }),
      (currentAccounts) => currentAccounts.length >= maxAmountOfAccounts
    )

const createHasMaxAmountOfAccountsSelectorDefinition = (config: {
  maxAmountOfAccounts?: number
}) => ({
  id: 'hasMaxAmountOfTrezorAccounts',
  selectorFactory: hasMaxAmountOfTrezorAccountsSelectorFactory(config),
  dependencies: [
    //
    { selector: 'filter' },
  ],
})

export default createHasMaxAmountOfAccountsSelectorDefinition
