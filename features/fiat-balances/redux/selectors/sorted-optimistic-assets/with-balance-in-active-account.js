const selectorFactory = (
  createAssetsWithBalanceSelector,
  sortedAssetsWithoutParentCombinedInActiveAccountSelector,
  fiatBalancesByAssetInActiveAccount,
  activeAccountAssetsBalanceSelector
) => {
  return createAssetsWithBalanceSelector({
    assetsListSelector: sortedAssetsWithoutParentCombinedInActiveAccountSelector,
    balancesSelector: activeAccountAssetsBalanceSelector,
    fiatBalancesSelector: fiatBalancesByAssetInActiveAccount,
  })
}

const sortedOptimisticAssetsWithBalanceInActiveAccountSelectorDefinition = {
  id: 'sortedOptimisticAssetsWithBalanceInActiveAccount',
  selectorFactory,
  dependencies: [
    //
    { selector: 'createAssetsWithBalance' },
    { selector: 'sortedOptimisticAssetsWithoutParentCombinedInActiveAccount' },
    { selector: 'optimisticByAssetInActiveAccount' },
    {
      module: 'optimisticBalances',
      selector: 'activeAccountAssetsBalanceSelector',
      optional: true,
    },
  ],
}

export default sortedOptimisticAssetsWithBalanceInActiveAccountSelectorDefinition
