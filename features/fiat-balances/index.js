import fiatBalancesDefinition from './module'
import {
  fiatBalancesAtomDefinition,
  nonDustBalanceAssetNamesAtomDefinition,
  optimisticFiatBalancesAtomDefinition,
} from './atoms'
import { fiatBalancesPluginDefinition, fiatBalancesAnalyticsPluginDefinition } from './plugin'
import trackNonDustAssetsNamesPluginDefinition from './plugin/track-non-dust-asset-names'
import fiatBalancesReportDefinition from './report'
import { defaultConfig, defaultNonDustAssetsConfig } from './shared'

/**
 * @param {object} config
 * @param {boolean} [config.optimistic]
 * @param {string[]} [config.balanceFields]
 * @param {object} [config.nonDustAssets]
 * @param {Array} [config.assetsToTrackForBalances]
 */
const fiatBalances = (config = Object.create(null)) => {
  const { optimistic, nonDustAssets, balanceFields, assetsToTrackForBalances } = {
    ...defaultConfig,
    ...config,
  }

  return {
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
        config: {
          ...defaultNonDustAssetsConfig,
          ...nonDustAssets,
        },
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
          config: {
            balanceFields,
          },
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
        definition: fiatBalancesAnalyticsPluginDefinition,
        config: { assetsToTrackForBalances },
      },
    ],
  }
}

export default fiatBalances
