import {
  nftsConfigsAtomDefinition,
  optimisticNftsAtomDefinition,
  nftsAtomDefinition,
  nftCollectionStatsAtomDefinition,
  nftsTxsAtomDefinition,
  hasNftsAtomDefinition,
  nftBatchMonitorStatusAtomDefinition,
  nftsMonitorStatusAtomDefinition,
} from './atoms/index.js'
import nftsModuleDefinition from './module/index.js'
import nftsMonitorDefinition from './monitor/index.js'
import nftsApiDefinition from './api/index.js'
import nftsProxyDefinition from './client/index.js'
import { nftsLifecyclePluginDefinition, nftsAnalyticsPluginDefinition } from './plugin/index.js'
import nftCollectionStatsMonitorDefinition from './monitor/NftsCollectionStatsMonitor.js'
import { DEFAULT_CONFIGS } from './constants/index.js'

const nfts = (
  { fetchCollectionStats, sandbox, useBatchMonitor, ...configOverrides } = Object.create(null)
) => {
  const baseConfig = sandbox ? DEFAULT_CONFIGS.sandbox : DEFAULT_CONFIGS.production
  const { baseUrl } = { ...baseConfig, ...configOverrides }

  return {
    id: 'nfts',
    definitions: [
      {
        definition: nftsConfigsAtomDefinition,
        aliases: [{ implementationId: 'unsafeStorage', interfaceId: 'storage' }],
        storage: { namespace: 'nfts-config' },
      },
      {
        definition: nftsAtomDefinition,
        storage: { namespace: 'nfts' },
      },
      {
        definition: nftsTxsAtomDefinition,
        storage: { namespace: 'nfts' },
      },
      { definition: optimisticNftsAtomDefinition },
      { definition: hasNftsAtomDefinition },
      {
        definition: nftCollectionStatsAtomDefinition,
        storage: { namespace: 'nfts' },
      },
      {
        definition: nftBatchMonitorStatusAtomDefinition,
        storage: { namespace: 'nfts' },
      },
      {
        definition: nftsMonitorStatusAtomDefinition,
        storage: { namespace: 'nfts' },
      },
      { definition: nftsMonitorDefinition, config: { useBatchMonitor } },
      {
        if: fetchCollectionStats,
        definition: nftCollectionStatsMonitorDefinition,
      },
      { definition: nftsModuleDefinition },
      { definition: nftsLifecyclePluginDefinition },
      {
        if: { registered: ['analytics'] },
        definition: nftsAnalyticsPluginDefinition,
      },
      { definition: nftsApiDefinition },
      {
        definition: nftsProxyDefinition,
        config: {
          baseUrl,
        },
      },
    ],
  }
}

export default nfts
