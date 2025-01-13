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

const sortedOptimisticAssetsWithoutParentCombinedInActiveAccountDefinition = {
  id: 'sortedOptimisticAssetsWithoutParentCombinedInActiveAccount',
  selectorFactory,
  dependencies: [
    //
    { selector: 'createSortOptimisticAssetsSelectorFactory' },
    { module: 'walletAccounts', selector: 'active' },
    { module: 'availableAssets', selector: 'allWithoutParentCombinedNetwork' },
  ],
}

export default sortedOptimisticAssetsWithoutParentCombinedInActiveAccountDefinition
