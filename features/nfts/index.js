import {
  nftsConfigsAtomDefinition,
  optimisticNftsAtomDefinition,
  nftsAtomDefinition,
  nftCollectionStatsAtomDefinition,
  nftsTxsAtomDefinition,
  hasNftsAtomDefinition,
  nftBatchMonitorStatusAtomDefinition,
} from './atoms'
import nftsModuleDefinition from './module'
import nftsMonitorDefinition from './monitor'
import nftsApiDefinition from './api'
import nftsProxyDefinition from './client'
import { nftsLifecyclePluginDefinition, nftsAnalyticsPluginDefinition } from './plugin'
import nftCollectionStatsMonitorDefinition from './monitor/NftsCollectionStatsMonitor'
import { DEFAULT_CONFIGS } from './constants'

const nfts = ({ fetchCollectionStats, sandbox, ...configOverrides } = Object.create(null)) => {
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
      { definition: nftsMonitorDefinition },
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
