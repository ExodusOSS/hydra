const selectorFactory = (
  createEnabledAssetsWithBalance,
  sortedAssetsWithBalanceInActiveAccount
) => {
  return createEnabledAssetsWithBalance({
    assetsListSelector: sortedAssetsWithBalanceInActiveAccount,
  })
}

const sortedOptimisticEnabledAssetsWithBalanceInActiveAccountSelectorDefinition = {
  id: 'sortedOptimisticEnabledAssetsWithBalanceInActiveAccount',
  selectorFactory,
  dependencies: [
    //
    { selector: 'createEnabledAssetsWithBalance' },
    { selector: 'sortedOptimisticAssetsWithBalanceInActiveAccount' },
  ],
}

export default sortedOptimisticEnabledAssetsWithBalanceInActiveAccountSelectorDefinition
