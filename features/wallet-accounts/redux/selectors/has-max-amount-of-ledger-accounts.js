import { createSelector } from 'reselect'

const hasMaxAmountOfLedgerAccountsSelectorFactory =
  ({ maxAmountOfAccounts = 3 }) =>
  (filter) =>
    createSelector(
      filter({ enabled: true, ledger: true }),
      (currentAccounts) => currentAccounts.length >= maxAmountOfAccounts
    )

const createHasMaxAmountOfAccountsSelectorDefinition = (config) => ({
  id: 'hasMaxAmountOfLedgerAccounts',
  selectorFactory: hasMaxAmountOfLedgerAccountsSelectorFactory(config),
  dependencies: [
    //
    { selector: 'filter' },
  ],
})

export default createHasMaxAmountOfAccountsSelectorDefinition
