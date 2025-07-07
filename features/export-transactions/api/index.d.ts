type ExportedTx = {
  date: tx.date
  type: string
  fromPortfolio: string
  toPortfolio: string
  outAmount: string
  outCurrency: string
  feeAmount: string
  feeCurrency: string
  toAddress: string
  outTxId: string
  outTxUrl: string
  inAmount: string
  inCurrency: string
  inTxId: string
  inTxUrl: string
  personalNote?: string
  tokens: string
  [other]: string
}

declare const exportTransactionsApiDefinition: {
  id: 'exportTransactionsApi'
  type: 'api'
  factory(): {
    exportTransactions: {
      exportForWalletAccount: (walletAccount: string) => ExportedTx[]
    }
  }
}

export default exportTransactionsApiDefinition
