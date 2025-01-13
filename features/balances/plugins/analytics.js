const createBalancesAnalyticsPlugin = ({
  analytics,
  hasBalanceAtom,
  assetsWithBalanceCountAtom,
  assetsTotalWalletAmountsAtom,
  config: { assetsToTrackForBalances },
}) => {
  let subscriptions = []

  const getAssetAmountFromNumberUnit = (unit) => {
    if (!unit) return 0
    return unit.toDefaultNumber()
  }

  const onStart = () => {
    analytics.requireDefaultEventProperties(['hasBalance', 'numberOfAssets'])

    const unsubscribeBalanceAtom = hasBalanceAtom.observe((hasBalance) =>
      analytics.setDefaultEventProperties({ hasBalance })
    )

    const unsubscribeBalanceCountAtom = assetsWithBalanceCountAtom.observe((numberOfAssets) =>
      analytics.setDefaultEventProperties({ numberOfAssets })
    )

    const unsubscribeWalletAmountsAtom = assetsTotalWalletAmountsAtom.observe(async (balances) => {
      const assetBalances = assetsToTrackForBalances.reduce((acc, obj) => {
        acc[obj.analyticsName] = getAssetAmountFromNumberUnit(balances.get(obj.assetName))
        return acc
      }, Object.create(null))
      analytics.setDefaultEventProperties(assetBalances)
    })

    subscriptions = [
      unsubscribeBalanceAtom,
      unsubscribeBalanceCountAtom,
      unsubscribeWalletAmountsAtom,
    ]
  }

  const onStop = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
  }

  return { onStart, onStop }
}

export default createBalancesAnalyticsPlugin
