import createBlockchainAnalyticsPlugin from './analytics.js'
import createBlockchainLifecyclePlugin from './lifecycle.js'
import createSyncEarliestTxDateToFusionPlugin from './sync-earliest-tx-plugin.js'
import type { Definition } from '@exodus/dependency-types'

export const blockchainMetadataPluginDefinition = {
  id: 'blockchainLifecyclePlugin',
  type: 'plugin',
  factory: createBlockchainLifecyclePlugin,
  dependencies: ['blockchainMetadata', 'blockchainMetadataAtom', 'port'],
  public: true,
} as const satisfies Definition

export const blockchainMetadataAnalyticsPluginDefinition = {
  id: 'blockchainAnalyticsPlugin',
  type: 'plugin',
  factory: createBlockchainAnalyticsPlugin,
  dependencies: ['analytics', 'txLogsAtom'],
  public: true,
} as const satisfies Definition

export const syncEarliestTxDatePluginDefinition = {
  id: 'syncEarliestTxDatePlugin',
  type: 'plugin',
  factory: createSyncEarliestTxDateToFusionPlugin,
  dependencies: ['logger', 'earliestTxDateAtom', 'txLogsAtom'],
  public: true,
} as const satisfies Definition
