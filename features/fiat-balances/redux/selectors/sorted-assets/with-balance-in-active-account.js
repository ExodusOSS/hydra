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

const sortedAssetsWithBalanceInActiveAccountSelectorDefinition = {
  id: 'sortedAssetsWithBalanceInActiveAccount',
  selectorFactory,
  dependencies: [
    //
    { selector: 'createAssetsWithBalance' },
    { selector: 'sortedAssetsWithoutParentCombinedInActiveAccount' },
    { selector: 'byAssetInActiveAccount' },
    { module: 'balances', selector: 'activeAccountAssetsBalanceSelector' },
  ],
}

export default sortedAssetsWithBalanceInActiveAccountSelectorDefinition
