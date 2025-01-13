const selectorFactory = (
  createAssetsWithBalanceSelector,
  assetsListSelector,
  fiatBalancesSelector,
  balancesSelector
) => {
  return createAssetsWithBalanceSelector({
    assetsListSelector,
    balancesSelector,
    fiatBalancesSelector,
  })
}

const sortedAssetsWithTotalBalanceSelectorDefinition = {
  id: 'sortedAssetsWithTotalBalance',
  selectorFactory,
  dependencies: [
    //
    { selector: 'createAssetsWithBalance' },
    { selector: 'sortedAssetsWithoutParentCombinedInActiveAccount' },
    { selector: 'byAsset' },
    { module: 'balances', selector: 'byAsset' },
  ],
}

export default sortedAssetsWithTotalBalanceSelectorDefinition
