const selectorFactory = (
  createAssetsWithBalanceSelector,
  sortedAssetsWithParentCombinedInActiveAccountSelector,
  fiatBalancesByAssetInActiveAccount,
  activeAccountAssetsBalanceSelector
) => {
  return createAssetsWithBalanceSelector({
    assetsListSelector: sortedAssetsWithParentCombinedInActiveAccountSelector,
    balancesSelector: activeAccountAssetsBalanceSelector,
    fiatBalancesSelector: fiatBalancesByAssetInActiveAccount,
  })
}

const sortedOptimisticAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition = {
  id: 'sortedOptimisticAssetsWithParentCombinedWithBalanceInActiveAccount',
  selectorFactory,
  dependencies: [
    //
    { selector: 'createAssetsWithBalance' },
    { selector: 'sortedOptimisticAssetsWithParentCombinedInActiveAccount' },
    { selector: 'optimisticByAssetInActiveAccount' },
    {
      module: 'optimisticBalances',
      selector: 'activeAccountAssetsBalanceSelector',
      optional: true,
    },
  ],
}

export default sortedOptimisticAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition
