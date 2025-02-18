import { flattenToPaths, filterAsync } from '@exodus/basic-utils'
import fiatCurrencies from '@exodus/fiat-currencies'

const { USD } = fiatCurrencies

const createTrackNonDustAssetNamesPlugin = ({
  assetsModule,
  fiatBalancesAtom,
  fiatRateConverter,
  nonDustBalanceAssetNamesAtom,
  config: { balanceThresholdsUsd, balanceThresholdByChainUsd, defaultBalanceThresholdUsd },
}) => {
  const handleFiatBalancesChanged = async ({ balances }) => {
    const { byAssetSource } = balances
    if (!byAssetSource) return

    const balancesByAssetSource = flattenToPaths(byAssetSource).map(
      ([walletAccount, assetName, _balanceField, balance]) => ({
        walletAccount,
        assetName,
        balance,
      })
    )

    const aboveThreshold = await filterAsync(
      balancesByAssetSource,
      async ({ assetName, balance }) => {
        const usdBalance = await fiatRateConverter.toFiatCurrency({
          currency: 'USD',
          amount: balance,
        })

        return isAboveEnableThreshold({ assetName, usdBalance })
      }
    )

    const nonDisableableAssetNamesSet = new Set(aboveThreshold.map(({ assetName }) => assetName))

    const before = [...(await nonDustBalanceAssetNamesAtom.get())]
    if (
      nonDisableableAssetNamesSet.size !== before.length ||
      before.some((x) => !nonDisableableAssetNamesSet.has(x))
    ) {
      const after = [...nonDisableableAssetNamesSet].sort()
      await nonDustBalanceAssetNamesAtom.set(after)
    }
  }

  let unobserveFiatBalancesAtom
  const onLoad = () => {
    unobserveFiatBalancesAtom = fiatBalancesAtom.observe((data) => {
      // don't block processing
      handleFiatBalancesChanged(data)
    })
  }

  const onUnload = () => {
    unobserveFiatBalancesAtom?.()
  }

  const resolveConfiguredThreshold = (asset) =>
    balanceThresholdsUsd[asset.name] ||
    balanceThresholdByChainUsd[asset.baseAsset.name] ||
    defaultBalanceThresholdUsd

  const isAboveEnableThreshold = async ({ assetName, usdBalance }) => {
    const asset = assetsModule.getAsset(assetName)
    const reserve = asset.accountReserve || asset.currency.ZERO
    const configuredThreshold = resolveConfiguredThreshold(asset)
    const reserveUsd = asset.accountReserve
      ? await fiatRateConverter.toFiatCurrency({
          currency: 'USD',
          amount: reserve,
        })
      : USD.ZERO

    const usdThreshold = reserveUsd.add(configuredThreshold)
    return usdBalance.gte(usdThreshold)
  }

  return {
    onLoad,
    onUnload,
  }
}

const trackNonDustAssetsNamesPluginDefinition = {
  id: 'trackNonDustAssetsNamesPlugin',
  type: 'plugin',
  factory: createTrackNonDustAssetNamesPlugin,
  dependencies: [
    'nonDustBalanceAssetNamesAtom',
    'fiatBalancesAtom',
    'fiatRateConverter',
    'assetsModule',
    'config?',
  ],
  public: true,
}

export default trackNonDustAssetsNamesPluginDefinition
