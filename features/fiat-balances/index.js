import fiatBalancesDefinition from './module'
import {
  fiatBalancesAtomDefinition,
  nonDustBalanceAssetNamesAtomDefinition,
  optimisticFiatBalancesAtomDefinition,
} from './atoms'
import fiatBalancesPluginDefinition, { fiatBalancesAnalyticsPlugin } from './plugin'
import trackNonDustAssetsNamesPluginDefinition from './plugin/track-non-dust-asset-names'
import fiatBalancesReportDefinition from './report'

const DEFAULT_BALANCE_FIELDS = ['balance']

/**
 * @param {object} opts
 * @param {boolean} [opts.optimistic]
 * @param {string[]} [opts.balanceFields]
 * @param {object} [opts.nonDustAssets]
 * @param {object} [opts.nonDustAssets.balanceThresholdsUsd]
 * @param {object} [opts.nonDustAssets.balanceThresholdByChainUsd]
 * @param {Array} [opts.assetsToTrackForBalances]
 * @param {import('@exodus/fiat-currencies').Unit} [opts.nonDustAssets.defaultBalanceThresholdUsd]
 */
const fiatBalances = (
  {
    optimistic = false,
    nonDustAssets: {
      balanceThresholdsUsd,
      balanceThresholdByChainUsd,
      defaultBalanceThresholdUsd,
    } = Object.create(null),
    balanceFields = DEFAULT_BALANCE_FIELDS,
    assetsToTrackForBalances = [],
  } = Object.create(null)
) => ({
  id: 'fiatBalances',
  definitions: [
    {
      definition: fiatBalancesDefinition,
      config: {
        balanceFields,
      },
    },
    { definition: fiatBalancesAtomDefinition },
    { definition: fiatBalancesPluginDefinition },
    { definition: fiatBalancesReportDefinition },
    {
      definition: trackNonDustAssetsNamesPluginDefinition,
      config: { balanceThresholdsUsd, balanceThresholdByChainUsd, defaultBalanceThresholdUsd },
    },
    { definition: nonDustBalanceAssetNamesAtomDefinition },
    {
      if: optimistic,
      definition: optimisticFiatBalancesAtomDefinition,
    },
    {
      if: optimistic,
      definition: {
        ...fiatBalancesDefinition,
        id: 'optimisticFiatBalances',
      },
      aliases: [
        {
          implementationId: 'optimisticBalancesAtom',
          interfaceId: 'balancesAtom',
        },
        {
          implementationId: 'optimisticFiatBalancesAtom',
          interfaceId: 'fiatBalancesAtom',
        },
      ],
    },
    {
      if: { registered: ['analytics'] },
      definition: fiatBalancesAnalyticsPlugin,
      config: { assetsToTrackForBalances },
    },
  ],
})

export default fiatBalances
