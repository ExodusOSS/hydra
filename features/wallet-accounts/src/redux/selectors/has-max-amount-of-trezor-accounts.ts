import type { WalletAccount } from '@exodus/models'
import { defineSelectorFactory } from '@exodus/redux-dependency-injection'
import { createSelector } from 'reselect'
import type { WalletAccountsSelectors } from '../types.js'

const hasMaxAmountOfTrezorAccountsSelectorFactory =
  ({ maxAmountOfAccounts = 3 }: { maxAmountOfAccounts?: number }) =>
  (filter: WalletAccountsSelectors['filter']) =>
    createSelector(
      filter({ enabled: true, trezor: true }),
      (currentAccounts: WalletAccount[]): boolean => currentAccounts.length >= maxAmountOfAccounts
    )

const createHasMaxAmountOfAccountsSelectorDefinition = (config: { maxAmountOfAccounts?: number }) =>
  defineSelectorFactory({
    id: 'hasMaxAmountOfTrezorAccounts',
    selectorFactory: hasMaxAmountOfTrezorAccountsSelectorFactory(config),
    dependencies: [
      //
      { selector: 'filter' },
    ],
  })

export default createHasMaxAmountOfAccountsSelectorDefinition
