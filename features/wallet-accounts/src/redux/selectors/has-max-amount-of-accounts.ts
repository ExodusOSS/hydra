import { createSelector } from 'reselect'
import type { WalletAccountsSelectors } from '../types.js'

const hasMaxAmountOfAccountsSelectorFactory =
  ({ maxAmountOfAccounts = 3 }: { maxAmountOfAccounts?: number }) =>
  (filter: WalletAccountsSelectors['filter']) =>
    createSelector(
      filter({ enabled: true, hardware: false, custodial: false }),
      (currentAccounts) => currentAccounts.length >= maxAmountOfAccounts
    )

const createHasMaxAmountOfAccountsSelectorDefinition = (config: {
  maxAmountOfAccounts?: number
}) => ({
  id: 'hasMaxAmountOfAccounts',
  selectorFactory: hasMaxAmountOfAccountsSelectorFactory(config),
  dependencies: [
    //
    { selector: 'filter' },
  ],
})

export default createHasMaxAmountOfAccountsSelectorDefinition
