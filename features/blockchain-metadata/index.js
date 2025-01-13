import blockchainMetadataApiDefinition from './api/index.js'
import {
  accountStatesAtomDefinition,
  txLogsAtomDefinition,
  earliestTxDateAtom,
} from './atoms/index.js'
import blockchainQueryModuleDefinition from './module/blockchain-query.js'
import blockchainMetadataDefinition from './module/index.js'
import txWatcherModuleDefinition from './module/tx-watcher.js'
import {
  blockchainMetadataPluginDefinition,
  syncEarliestTxDatePluginDefinition,
  blockchainMetadataAnalyticsPluginDefinition,
} from './plugin/index.js'
import blockchainMetadataReportDefinition from './report/index.js'

const blockchainMetadata = () => {
  return {
    id: 'blockchainMetadata',
    definitions: [
      {
        definition: blockchainMetadataDefinition,
        storage: { namespace: ['blockchain', 'v1'] },
      },
      { definition: blockchainMetadataPluginDefinition },
      { definition: blockchainMetadataApiDefinition },
      { definition: txLogsAtomDefinition },
      { definition: accountStatesAtomDefinition },
      { definition: earliestTxDateAtom },
      { definition: blockchainMetadataReportDefinition },
      { definition: syncEarliestTxDatePluginDefinition },
      { definition: txWatcherModuleDefinition },
      { definition: blockchainQueryModuleDefinition },
      {
        if: { registered: ['analytics'] },
        definition: blockchainMetadataAnalyticsPluginDefinition,
      },
    ],
  }
}

export default blockchainMetadata
