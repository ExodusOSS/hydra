import createBlockchainAnalyticsPlugin from './analytics.js'
import createBlockchainLifecyclePlugin from './lifecycle.js'
import createSyncEarliestTxDateToFusionPlugin from './sync-earliest-tx-plugin.js'

export const blockchainMetadataPluginDefinition = {
  id: 'blockchainLifecyclePlugin',
  type: 'plugin',
  factory: createBlockchainLifecyclePlugin,
  dependencies: ['blockchainMetadata', 'txLogsAtom', 'accountStatesAtom', 'port'],
  public: true,
}

export const blockchainMetadataAnalyticsPluginDefinition = {
  id: 'blockchainAnalyticsPlugin',
  type: 'plugin',
  factory: createBlockchainAnalyticsPlugin,
  dependencies: ['analytics', 'txLogsAtom'],
  public: true,
}

export const syncEarliestTxDatePluginDefinition = {
  id: 'syncEarliestTxDatePlugin',
  type: 'plugin',
  factory: createSyncEarliestTxDateToFusionPlugin,
  dependencies: ['logger', 'earliestTxDateAtom', 'txLogsAtom'],
  public: true,
}
