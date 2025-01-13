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

const sortedAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition = {
  id: 'sortedAssetsWithParentCombinedWithBalanceInActiveAccount',
  selectorFactory,
  dependencies: [
    //
    { selector: 'createAssetsWithBalance' },
    { selector: 'sortedAssetsWithParentCombinedInActiveAccount' },
    { selector: 'byAssetInActiveAccount' },
    { module: 'balances', selector: 'activeAccountAssetsBalanceSelector' },
  ],
}

export default sortedAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition
