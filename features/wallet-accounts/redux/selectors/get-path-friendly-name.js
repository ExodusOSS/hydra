import { createSelector } from 'reselect'

const getPathFriendlyNameSelectorFactory = (getProperNameSelector) =>
  createSelector(
    getProperNameSelector,
    (getWalletAccountProperName) =>
      (walletAccount, { maxLength } = {}) =>
        getWalletAccountProperName(walletAccount, { maxLength })
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
}

export default getPathFriendlyNameSelectorDefinition
