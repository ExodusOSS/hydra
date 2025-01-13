const createBlockchainMetadataApi = ({ blockchainMetadata, blockchainQuery }) => ({
  blockchainMetadata: {
    getTxLog: blockchainMetadata.getTxLog,
    getLoadedTxLogs: blockchainMetadata.getLoadedTxLogs,
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
  dependencies: ['blockchainMetadata', 'blockchainQuery'],
}

export default blockchainMetadataApiDefinition
