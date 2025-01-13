import { createSelector } from 'reselect'

const getExportPathNameSelectorFactory = (getWalletAccountSelector, getPathFriendlyNameSelector) =>
  createSelector(
    getWalletAccountSelector,
    getPathFriendlyNameSelector,
    (getWalletAccount, getWalletAccountPathFriendlyName) => (walletAccount) => {
      const { isHardware } = getWalletAccount(walletAccount)
      return isHardware ? getWalletAccountPathFriendlyName(walletAccount) : walletAccount
    }
  )

const getExportPathNameSelectorDefinition = {
  id: 'getExportPathName',
  selectorFactory: getExportPathNameSelectorFactory,
  dependencies: [
    //
    { selector: 'get' },
    { selector: 'getPathFriendlyName' },
  ],
}

export default getExportPathNameSelectorDefinition
