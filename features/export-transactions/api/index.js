const createExportTransactionsApi = ({ exportTransactions }) => ({
  exportTransactions: {
    exportForWalletAccount: exportTransactions.exportForWalletAccount,
    getCSVExportFields: exportTransactions.getCSVExportFields,
  },
})

const exportTransactionsApiDefinition = {
  id: 'exportTransactionsApi',
  type: 'api',
  factory: createExportTransactionsApi,
  dependencies: ['exportTransactions'],
}

export default exportTransactionsApiDefinition
