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

const sortedOptimisticAssetsWithParentCombinedInActiveAccountDefinition = {
  id: 'sortedOptimisticAssetsWithParentCombinedInActiveAccount',
  selectorFactory,
  dependencies: [
    //
    { selector: 'createSortOptimisticAssetsSelectorFactory' },
    { module: 'walletAccounts', selector: 'active' },
    { module: 'availableAssets', selector: 'allWithParentCombinedNetwork' },
  ],
}

export default sortedOptimisticAssetsWithParentCombinedInActiveAccountDefinition
