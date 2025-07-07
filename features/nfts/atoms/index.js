import createNftsAtom from './nfts.js'
import createNftsTxsAtom from './nfts-txs.js'
import createNftsConfigsAtom from './nfts-configs.js'
import createHasNftsAtom from './has-nfts.js'
import createOptimisticNftsAtom from './optimistic-nfts.js'
import createNftCollectionsStatsAtom from './collection-stats.js'
import createNftBatchMonitorStatusAtom from './batch-monitor-status.js'
import createNftsMonitorStatusAtom from './nfts-monitor-status.js'

export const nftsAtomDefinition = {
  id: 'nftsAtom',
  type: 'atom',
  factory: createNftsAtom,
  dependencies: ['storage'],
  public: true,
}

export const nftsTxsAtomDefinition = {
  id: 'nftsTxsAtom',
  type: 'atom',
  factory: createNftsTxsAtom,
  dependencies: ['storage'],
  public: true,
}

export const nftsConfigsAtomDefinition = {
  id: 'nftsConfigAtom',
  type: 'atom',
  factory: createNftsConfigsAtom,
  dependencies: ['storage'],
  public: true,
}

export const hasNftsAtomDefinition = {
  id: 'hasNftsAtom',
  type: 'atom',
  factory: createHasNftsAtom,
  dependencies: ['nftsAtom'],
  public: true,
}

export const optimisticNftsAtomDefinition = {
  id: 'nftsOptimisticAtom',
  type: 'atom',
  factory: createOptimisticNftsAtom,
  dependencies: [],
  public: true,
}

export const nftCollectionStatsAtomDefinition = {
  id: 'nftCollectionStatsAtom',
  type: 'atom',
  factory: createNftCollectionsStatsAtom,
  dependencies: ['storage'],
  public: true,
}

export const nftBatchMonitorStatusAtomDefinition = {
  id: 'nftBatchMonitorStatusAtom',
  type: 'atom',
  factory: createNftBatchMonitorStatusAtom,
  dependencies: ['storage'],
  public: true,
}

export const nftsMonitorStatusAtomDefinition = {
  id: 'nftsMonitorStatusAtom',
  type: 'atom',
  factory: createNftsMonitorStatusAtom,
  dependencies: ['storage'],
  public: true,
}
