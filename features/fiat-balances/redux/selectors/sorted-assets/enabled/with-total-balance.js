const selectorFactory = (createEnabledAssetsWithBalance, sortedAssetsWithTotalBalance) => {
  return createEnabledAssetsWithBalance({
    assetsListSelector: sortedAssetsWithTotalBalance,
  })
}

const sortedEnabledAssetsWithTotalBalanceSelectorDefinition = {
  id: 'sortedEnabledAssetsWithTotalBalance',
  selectorFactory,
  dependencies: [
    //
    { selector: 'createEnabledAssetsWithBalance' },
    { selector: 'sortedAssetsWithTotalBalance' },
  ],
}

export default sortedEnabledAssetsWithTotalBalanceSelectorDefinition
