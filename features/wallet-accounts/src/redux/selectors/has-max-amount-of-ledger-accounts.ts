import { createSelector } from 'reselect'
import type { WalletAccountsSelectors } from '../types.js'

const hasMaxAmountOfLedgerAccountsSelectorFactory =
  ({ maxAmountOfAccounts = 3 }: { maxAmountOfAccounts?: number }) =>
  (filter: WalletAccountsSelectors['filter']) =>
    createSelector(
      filter({ enabled: true, ledger: true }),
      (currentAccounts) => currentAccounts.length >= maxAmountOfAccounts
    )

const createHasMaxAmountOfAccountsSelectorDefinition = (config: {
  maxAmountOfAccounts?: number
}) => ({
  id: 'hasMaxAmountOfLedgerAccounts',
  selectorFactory: hasMaxAmountOfLedgerAccountsSelectorFactory(config),
  dependencies: [
    //
    { selector: 'filter' },
  ],
})

export default createHasMaxAmountOfAccountsSelectorDefinition
