import { createSelector } from 'reselect'
import type { WalletAccountsSelectors } from '../types.js'

const getPathFriendlyNameSelectorFactory = (
  getProperNameSelector: WalletAccountsSelectors['getProperName']
) =>
  createSelector(
    getProperNameSelector,
    (getWalletAccountProperName: (name: string, opts?: { maxLength?: number }) => string | null) =>
      (walletAccount: string, { maxLength }: { maxLength?: number } = {}) =>
        getWalletAccountProperName(walletAccount, { maxLength })!
          .replace(/[^\da-z-]/giu, '_') // file-path friendly string
          .toLowerCase()
  )

const getPathFriendlyNameSelectorDefinition = {
  id: 'getPathFriendlyName',
  selectorFactory: getPathFriendlyNameSelectorFactory,
  dependencies: [
    //
    { selector: 'getProperName' },
  ],
} as const

export default getPathFriendlyNameSelectorDefinition
