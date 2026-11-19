import { defineSelectorFactory } from '@exodus/redux-dependency-injection'
import { createSelector } from 'reselect'
import type { WalletAccountsSelectors } from '../types.js'

const getPathFriendlyNameSelectorFactory = (
  getProperNameSelector: WalletAccountsSelectors['getProperName']
) =>
  createSelector(
    getProperNameSelector,
    (getWalletAccountProperName: (name: string, opts?: { maxLength?: number }) => string | null) =>
      (walletAccount: string, { maxLength }: { maxLength?: number } = {}): string =>
        getWalletAccountProperName(walletAccount, { maxLength })!
          .replace(/[^\da-z-]/giu, '_') // file-path friendly string
          .toLowerCase()
  )

const getPathFriendlyNameSelectorDefinition = defineSelectorFactory({
  id: 'getPathFriendlyName',
  selectorFactory: getPathFriendlyNameSelectorFactory,
  dependencies: [
    //
    { selector: 'getProperName' },
  ],
})

export default getPathFriendlyNameSelectorDefinition
