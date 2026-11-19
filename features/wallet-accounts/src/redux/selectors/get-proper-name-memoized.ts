import type { WalletAccount } from '@exodus/models'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { defineSelectorFactory } from '@exodus/redux-dependency-injection'
import { createSelector } from 'reselect'
import {
  capitalize,
  handleLongAccountName,
  handleAccountsWithSameLabels,
} from './get-proper-name.js'
import type { WalletAccountsSelectors } from '../types.js'

const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

const createProperNameSelectorFactory = (
  walletAccountsSelector: WalletAccountsSelectors['data'],
  getMemoizedSelector: GetMemoizedSelector
) =>
  memoize(
    (walletAccountName: string, { maxLength }: { maxLength?: number } = {}) =>
      createSelector(
        walletAccountsSelector,
        getMemoizedSelector(walletAccountName),
        (
          walletAccounts: Record<string, WalletAccount>,
          walletAccount: WalletAccount
        ): string | null => {
          if (!walletAccounts[walletAccountName]) return null

          const { source, label, id } = walletAccount

          let displayLabel = label || capitalize(source)

          displayLabel = handleLongAccountName({
            displayLabel,
            maxLength,
          })

          if (source !== 'exodus') {
            displayLabel = handleAccountsWithSameLabels({
              label,
              displayLabel,
              id,
              source,
              allWalletAccountObjects: Object.values(walletAccounts),
            })
          }

          return displayLabel
        }
      ),
    (...args) => JSON.stringify(args)
  )

const createProperNameSelectorDefinition = defineSelectorFactory({
  id: 'createProperNameSelector',
  selectorFactory: createProperNameSelectorFactory,
  dependencies: [
    //
    { selector: 'data' },
    { selector: 'getMemoized' },
  ],
})

type GetMemoizedSelector = (name: string) => (state: unknown) => WalletAccount

export default createProperNameSelectorDefinition
