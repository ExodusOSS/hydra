import createNftsAnalyticsPlugin from './analytics.js'
import createNftsLifecyclePlugin from './lifecycle.js'

export const nftsLifecyclePluginDefinition = {
  id: 'nftsLifecyclePlugin',
  type: 'plugin',
  factory: createNftsLifecyclePlugin,
  dependencies: [
    'nfts',
    'nftsMonitor',
    'port',
    'nftsAtom',
    'nftsTxsAtom',
    'nftsConfigAtom',
    'nftsOptimisticAtom',
    'nftCollectionStatsAtom',
    'nftBatchMonitorStatusAtom',
  ],
  public: true,
}

export const nftsAnalyticsPluginDefinition = {
  id: 'nftsAnalyticsPlugin',
  type: 'plugin',
  factory: createNftsAnalyticsPlugin,
  dependencies: ['analytics', 'hasNftsAtom'],
  public: true,
}
