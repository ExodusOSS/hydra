import { createSelector } from 'reselect'
import type { WalletAccountsSelectors } from '../types.js'

/**
 * Returns an array of all known non-custodial wallet account names.
 */
const allNonCustodialSelectorFactory = (
  namesSelector: WalletAccountsSelectors['names'],
  isCustodialSelector: WalletAccountsSelectors['isCustodial']
) =>
  createSelector(
    namesSelector,
    isCustodialSelector,
    (allWalletAccounts: string[], isCustodialWallet: (name: string) => boolean) =>
      allWalletAccounts.filter((walletAccount: string) => !isCustodialWallet(walletAccount))
  )

const allNonCustodialSelectorDefinition = {
  id: 'allNonCustodial',
  selectorFactory: allNonCustodialSelectorFactory,
  dependencies: [
    //
    { selector: 'names' },
    { selector: 'isCustodial' },
  ],
} as const

export default allNonCustodialSelectorDefinition
