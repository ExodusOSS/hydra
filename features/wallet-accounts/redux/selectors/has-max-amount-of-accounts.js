import { createSelector } from 'reselect'

const hasMaxAmountOfAccountsSelectorFactory =
  ({ maxAmountOfAccounts = 3 }) =>
  (filter) =>
    createSelector(
      filter({ enabled: true, hardware: false, custodial: false }),
      (currentAccounts) => {
        return currentAccounts.length >= maxAmountOfAccounts
      }
    )

const createHasMaxAmountOfAccountsSelectorDefinition = (config) => ({
  id: 'hasMaxAmountOfAccounts',
  selectorFactory: hasMaxAmountOfAccountsSelectorFactory(config),
  dependencies: [
    //
    { selector: 'filter' },
  ],
})

export default createHasMaxAmountOfAccountsSelectorDefinition
