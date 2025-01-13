const selectorFactory = (
  createEnabledAssetsWithBalance,
  sortedAssetsWithParentCombinedWithBalanceInActiveAccount
) => {
  return createEnabledAssetsWithBalance({
    assetsListSelector: sortedAssetsWithParentCombinedWithBalanceInActiveAccount,
  })
}

const sortedOptimisticEnabledAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition =
  {
    id: 'sortedOptimisticEnabledAssetsWithParentCombinedWithBalanceInActiveAccount',
    selectorFactory,
    dependencies: [
      //
      { selector: 'createEnabledAssetsWithBalance' },
      { selector: 'sortedOptimisticAssetsWithParentCombinedWithBalanceInActiveAccount' },
    ],
  }

export default sortedOptimisticEnabledAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition
