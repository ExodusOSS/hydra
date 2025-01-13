import { createSelector } from 'reselect'

/**
 * Returns an array of all known non-custodial wallet account names.
 */
const allNonCustodialSelectorFactory = (namesSelector, isCustodialSelector) =>
  createSelector(namesSelector, isCustodialSelector, (allWalletAccounts, isCustodialWallet) =>
    allWalletAccounts.filter((walletAccount) => !isCustodialWallet(walletAccount))
  )

const allNonCustodialSelectorDefinition = {
  id: 'allNonCustodial',
  selectorFactory: allNonCustodialSelectorFactory,
  dependencies: [
    //
    { selector: 'names' },
    { selector: 'isCustodial' },
  ],
}

export default allNonCustodialSelectorDefinition
