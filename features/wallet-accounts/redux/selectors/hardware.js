import { createSelector } from 'reselect'

/**
 * Returns an array of all wallet account names which belong to hardware wallets.
 */
const selectorFactory = (walletAccountNamesSelector, getWalletAccountSelector) =>
  createSelector(
    walletAccountNamesSelector,
    getWalletAccountSelector,
    (walletAccountNames, getWalletAccount) =>
      walletAccountNames.filter((walletAccount) => getWalletAccount(walletAccount).isHardware)
  )

const hardwareSelectorDefinition = {
  id: 'hardware',
  selectorFactory,
  dependencies: [
    //
    { selector: 'names' },
    { selector: 'get' },
  ],
}

export default hardwareSelectorDefinition
