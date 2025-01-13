const createFiatBalancesAnalyticsPlugin = ({
  analytics,
  fiatBalancesAtom,
  config: { assetsToTrackForBalances },
}) => {
  let subscriptions = []
  const onStart = () => {
    const unsubscribeBalancesAtom = fiatBalancesAtom.observe(({ balances }) => {
      const assetFiatBalances = assetsToTrackForBalances.reduce((acc, obj) => {
        acc[obj.analyticsName] = balances?.byAsset[obj.assetName]?.balance.toDefaultNumber()
        return acc
      }, Object.create(null))
      analytics.setDefaultEventProperties({
        ...assetFiatBalances,
        totalBalanceUsd: balances?.totals?.balance?.toDefaultNumber(),
      })
    })

    subscriptions = [unsubscribeBalancesAtom]
  }

  const onStop = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
  }

  return { onStart, onStop }
}

export default createFiatBalancesAnalyticsPlugin
