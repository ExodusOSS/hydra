import type { WalletAccount } from '@exodus/models'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'
import type { WalletAccountsSelectors } from '../types.js'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const findSelectorFactory = (filterSelector: WalletAccountsSelectors['filter']) =>
  memoize(
    (condition: Record<string, boolean> = {}) =>
      createSelector(filterSelector(condition), (filter: WalletAccount[]) => {
        return filter[0]
      }),
    (options) => JSON.stringify(options)
  )

const findSelectorDefinition = {
  id: 'find',
  selectorFactory: findSelectorFactory,
  dependencies: [
    //
    { selector: 'filter' },
  ],
} as const

export default findSelectorDefinition
