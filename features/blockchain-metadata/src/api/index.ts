import type { Definition } from '@exodus/dependency-types'
import type { BlockchainMetadata, BlockchainMetadataApi, BlockchainQuery } from '../types.js'

export interface BlockchainMetadataApiDependencies {
  blockchainMetadata: BlockchainMetadata
  blockchainQuery: BlockchainQuery
}

const createBlockchainMetadataApi = ({
  blockchainMetadata,
  blockchainQuery,
}: BlockchainMetadataApiDependencies): BlockchainMetadataApi => ({
  blockchainMetadata: {
    getTxLog: blockchainMetadata.getTxLog,
    getLoadedTxLogs: blockchainMetadata.getLoadedTxLogs,
    addTxs: blockchainMetadata.addTxs,
    updateTxs: blockchainMetadata.updateTxs,
    overwriteTxs: blockchainMetadata.overwriteTxs,
    clearTxs: blockchainMetadata.clearTxs,
    removeTxs: blockchainMetadata.removeTxs,
    getAccountState: blockchainMetadata.getAccountState,
    getLoadedAccountStates: blockchainMetadata.getLoadedAccountStates,
    updateAccountState: blockchainMetadata.updateAccountState,
    removeAccountState: blockchainMetadata.removeAccountState,
    batch: blockchainMetadata.batch,
    isUsedRecipientAddress: blockchainQuery.isUsedRecipientAddress,
  },
})

const blockchainMetadataApiDefinition = {
  id: 'blockchainMetadataApi',
  type: 'api',
  factory: createBlockchainMetadataApi,
  dependencies: ['blockchainMetadata', 'blockchainQuery'] as const,
} as const satisfies Definition

export default blockchainMetadataApiDefinition
