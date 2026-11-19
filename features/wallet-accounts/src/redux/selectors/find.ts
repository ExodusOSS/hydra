import type { WalletAccount } from '@exodus/models'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { defineSelectorFactory } from '@exodus/redux-dependency-injection'
import { createSelector } from 'reselect'
import type { WalletAccountsSelectors } from '../types.js'

const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

const findSelectorFactory = (filterSelector: WalletAccountsSelectors['filter']) =>
  memoize(
    (condition: Record<string, boolean> = {}) =>
      createSelector(
        filterSelector(condition),
        (filter: WalletAccount[]): WalletAccount | undefined => {
          return filter[0]
        }
      ),
    (options) => JSON.stringify(options)
  )

const findSelectorDefinition = defineSelectorFactory({
  id: 'find',
  selectorFactory: findSelectorFactory,
  dependencies: [
    //
    { selector: 'filter' },
  ],
})

export default findSelectorDefinition
