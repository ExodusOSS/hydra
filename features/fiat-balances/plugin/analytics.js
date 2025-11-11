const createFiatBalancesAnalyticsPlugin = ({
  analytics,
  fiatBalancesAtom,
  config: { assetsToTrackForBalances },
}) => {
  let subscriptions = []

  const setBalanceProperties = (balances) => {
    const assetFiatBalances = assetsToTrackForBalances.reduce((acc, obj) => {
      // Always set a value, default to 0 if balance doesn't exist
      acc[obj.analyticsName] = balances?.byAsset[obj.assetName]?.balance.toDefaultNumber() ?? 0
      return acc
    }, Object.create(null))
    analytics.setDefaultEventProperties({
      ...assetFiatBalances,
      // Always set totalBalanceUsd, default to 0 if not available
      totalBalanceUsd: balances?.totals?.balance?.toDefaultNumber() ?? 0,
    })
  }

  const onStart = () => {
    setBalanceProperties(undefined)

    const unsubscribeBalancesAtom = fiatBalancesAtom.observe(({ balances }) => {
      setBalanceProperties(balances)
    })

    subscriptions = [unsubscribeBalancesAtom]
  }

  const onStop = () => {
    subscriptions.forEach((unsubscribe) => unsubscribe())
  }

  return { onStart, onStop }
}

const fiatBalancesAnalyticsPluginDefinition = {
  id: 'fiatBalancesAnalyticsPlugin',
  type: 'plugin',
  factory: createFiatBalancesAnalyticsPlugin,
  dependencies: ['analytics', 'fiatBalancesAtom', 'config?'],
  public: true,
}

export default fiatBalancesAnalyticsPluginDefinition
