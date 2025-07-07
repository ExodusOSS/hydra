import fiatBalancesDefinition from './module/index.js'
import {
  fiatBalancesAtomDefinition,
  nonDustBalanceAssetNamesAtomDefinition,
  optimisticFiatBalancesAtomDefinition,
} from './atoms/index.js'
import {
  fiatBalancesPluginDefinition,
  fiatBalancesAnalyticsPluginDefinition,
} from './plugin/index.js'
import trackNonDustAssetsNamesPluginDefinition from './plugin/track-non-dust-asset-names.js'
import { defaultConfig, defaultNonDustAssetsConfig } from './shared/index.js'

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
      // This report was intentionally omitted as it did not provide useful value in practice.
      // We prefer less data over more when it's not meaningful, keeping them commented for reference.
      // { definition: fiatBalancesReportDefinition },
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
        },
        config: {
          balanceFields,
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
