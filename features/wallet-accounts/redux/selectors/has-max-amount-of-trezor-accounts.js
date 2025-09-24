import { createSelector } from 'reselect'

const hasMaxAmountOfTrezorAccountsSelectorFactory =
  ({ maxAmountOfAccounts = 3 }) =>
  (filter) =>
    createSelector(
      filter({ enabled: true, trezor: true }),
      (currentAccounts) => currentAccounts.length >= maxAmountOfAccounts
    )

const createHasMaxAmountOfAccountsSelectorDefinition = (config) => ({
  id: 'hasMaxAmountOfTrezorAccounts',
  selectorFactory: hasMaxAmountOfTrezorAccountsSelectorFactory(config),
  dependencies: [
    //
    { selector: 'filter' },
  ],
})

export default createHasMaxAmountOfAccountsSelectorDefinition
