const selectorFactory = (
  createEnabledAssetsWithBalance,
  sortedAssetsWithParentCombinedWithBalanceInActiveAccount
) => {
  return createEnabledAssetsWithBalance({
    assetsListSelector: sortedAssetsWithParentCombinedWithBalanceInActiveAccount,
  })
}

const sortedEnabledAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition = {
  id: 'sortedEnabledAssetsWithParentCombinedWithBalanceInActiveAccount',
  selectorFactory,
  dependencies: [
    //
    { selector: 'createEnabledAssetsWithBalance' },
    { selector: 'sortedAssetsWithParentCombinedWithBalanceInActiveAccount' },
  ],
}

export default sortedEnabledAssetsWithParentCombinedWithBalanceInActiveAccountSelectorDefinition
