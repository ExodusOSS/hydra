import blockchainMetadataApiDefinition from './api/index.js'
import {
  accountStatesAtomDefinition,
  blockchainMetadataAtomDefinition,
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
import { safeString } from '@exodus/safe-string'

const blockchainMetadata = () => {
  return {
    id: safeString`blockchainMetadata`,
    definitions: [
      {
        definition: blockchainMetadataDefinition,
        storage: { namespace: ['blockchain', 'v1'] },
      },
      { definition: blockchainMetadataPluginDefinition },
      { definition: blockchainMetadataApiDefinition },
      { definition: blockchainMetadataAtomDefinition },
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
