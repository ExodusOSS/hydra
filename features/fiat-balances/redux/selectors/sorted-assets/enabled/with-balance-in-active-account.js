const selectorFactory = (
  createEnabledAssetsWithBalance,
  sortedAssetsWithBalanceInActiveAccount
) => {
  return createEnabledAssetsWithBalance({
    assetsListSelector: sortedAssetsWithBalanceInActiveAccount,
  })
}

const sortedEnabledAssetsWithBalanceInActiveAccountSelectorDefinition = {
  id: 'sortedEnabledAssetsWithBalanceInActiveAccount',
  selectorFactory,
  dependencies: [
    //
    { selector: 'createEnabledAssetsWithBalance' },
    { selector: 'sortedAssetsWithBalanceInActiveAccount' },
  ],
}

export default sortedEnabledAssetsWithBalanceInActiveAccountSelectorDefinition
