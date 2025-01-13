const selectorFactory = (
  createSortAssetsSelectorFactory,
  activeWalletAccountSelector,
  allWithoutParentCombinedNetwork
) => {
  const createSortedWithoutParentCombinedSelector = createSortAssetsSelectorFactory(
    allWithoutParentCombinedNetwork
  )

  return (state) =>
    createSortedWithoutParentCombinedSelector(activeWalletAccountSelector(state))(state)
}

const sortedAssetsWithoutParentCombinedInActiveAccountDefinition = {
  id: 'sortedAssetsWithoutParentCombinedInActiveAccount',
  selectorFactory,
  dependencies: [
    //
    { selector: 'createSortAssetsSelectorFactory' },
    { module: 'walletAccounts', selector: 'active' },
    { module: 'availableAssets', selector: 'allWithoutParentCombinedNetwork' },
  ],
}

export default sortedAssetsWithoutParentCombinedInActiveAccountDefinition
