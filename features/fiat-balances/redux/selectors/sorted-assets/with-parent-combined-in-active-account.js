const selectorFactory = (
  createSortAssetsSelectorFactory,
  activeWalletAccountSelector,
  allWithParentCombinedNetwork
) => {
  const createSortedWithParentCombinedSelector = createSortAssetsSelectorFactory(
    allWithParentCombinedNetwork
  )

  return (state) =>
    createSortedWithParentCombinedSelector(activeWalletAccountSelector(state))(state)
}

const sortedAssetsWithParentCombinedInActiveAccountDefinition = {
  id: 'sortedAssetsWithParentCombinedInActiveAccount',
  selectorFactory,
  dependencies: [
    //
    { selector: 'createSortAssetsSelectorFactory' },
    { module: 'walletAccounts', selector: 'active' },
    { module: 'availableAssets', selector: 'allWithParentCombinedNetwork' },
  ],
}

export default sortedAssetsWithParentCombinedInActiveAccountDefinition
