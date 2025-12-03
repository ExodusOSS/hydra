const createFiatBalancesAnalyticsPlugin = ({
  analytics,
  assetsTotalWalletAmountsAtom,
  fiatRateConverter,
  config: { assetsToTrackForBalances },
}) => {
  let subscriptions = []

  const setBalanceProperties = async (cryptoBalancesByAsset) => {
    if (!cryptoBalancesByAsset) {
      return
    }

    // Convert each asset's total crypto balance to USD
    const assetFiatBalances = Object.fromEntries(
      await Promise.all(
        assetsToTrackForBalances.map(async ({ assetName, analyticsName }) => {
          const cryptoBalance = cryptoBalancesByAsset.get(assetName)
          if (cryptoBalance) {
            const balanceUSD = await fiatRateConverter.toFiatCurrency({
              amount: cryptoBalance,
              currency: 'USD',
            })
            return [analyticsName, balanceUSD.toDefaultNumber()]
          }

          return [analyticsName, 0]
        })
      )
    )

    const totalBalanceUsd = Object.values(assetFiatBalances).reduce((sum, value) => sum + value, 0)

    analytics.setDefaultEventProperties({
      ...assetFiatBalances,
      totalBalanceUsd,
    })
  }

  const onStart = () => {
    const unsubscribe = assetsTotalWalletAmountsAtom.observe((cryptoBalancesByAsset) => {
      setBalanceProperties(cryptoBalancesByAsset)
    })

    subscriptions = [unsubscribe]
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
  dependencies: ['analytics', 'assetsTotalWalletAmountsAtom', 'fiatRateConverter', 'config?'],
  public: true,
}

export default fiatBalancesAnalyticsPluginDefinition
