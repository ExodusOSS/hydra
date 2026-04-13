import type { WalletAccount } from '@exodus/models'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'
import {
  capitalize,
  handleLongAccountName,
  handleAccountsWithSameLabels,
} from './get-proper-name.js'
import type { WalletAccountsSelectors } from '../types.js'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const createProperNameSelectorFactory = (
  walletAccountsSelector: WalletAccountsSelectors['data'],
  getMemoizedSelector: GetMemoizedSelector
) =>
  memoize(
    (walletAccountName: string, { maxLength }: { maxLength?: number } = {}) =>
      createSelector(
        walletAccountsSelector,
        getMemoizedSelector(walletAccountName),
        (walletAccounts: Record<string, WalletAccount>, walletAccount: WalletAccount) => {
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

const createProperNameSelectorDefinition = {
  id: 'createProperNameSelector',
  selectorFactory: createProperNameSelectorFactory,
  dependencies: [
    //
    { selector: 'data' },
    { selector: 'getMemoized' },
  ],
} as const

type GetMemoizedSelector = (name: string) => (state: unknown) => WalletAccount

export default createProperNameSelectorDefinition
