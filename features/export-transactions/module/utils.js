export const formatTransactionOutput = ({
  tx,
  isWithdrawal,
  asset,
  coinAmount,
  coinCurrency,
  feeAmount,
  feeCurrency,
  personalNote,
  walletAccount,
  oppositeWalletAccount,
}) => {
  const coinAmountOutput =
    typeof coinAmount?.toDefaultNumber === 'function' ? coinAmount.toDefaultNumber() : ''
  const feeAmountOutput =
    typeof feeAmount?.toDefaultNumber === 'function' ? feeAmount.toDefaultNumber() : ''

  return {
    date: tx.date,
    type: `${isWithdrawal ? 'withdrawal' : 'deposit'}${tx.error ? ' (failed)' : ''}`,
    fromPortfolio: tx.sent ? walletAccount : oppositeWalletAccount,
    toPortfolio: tx.sent ? oppositeWalletAccount : walletAccount,
    outAmount: isWithdrawal ? coinAmountOutput : '',
    outCurrency: isWithdrawal ? coinCurrency : '',
    feeAmount: isWithdrawal || !feeAmount?.isZero ? feeAmountOutput : '',
    feeCurrency: isWithdrawal || !feeAmount?.isZero ? feeCurrency : '',
    toAddress: [tx.to].flat().join(' | '),
    outTxId: isWithdrawal ? tx.txId : '',
    outTxUrl: isWithdrawal ? asset.blockExplorer.txUrl(tx.txId) : '',
    inAmount: isWithdrawal ? '' : coinAmountOutput,
    inCurrency: isWithdrawal ? '' : coinCurrency,
    inTxId: isWithdrawal ? '' : tx.txId,
    inTxUrl: isWithdrawal ? '' : asset.blockExplorer.txUrl(tx.txId),
    personalNote: personalNote?.getMessage({ to: tx.to }),

    tokens: tx.tokens.join(' '),

    // used later, not exported
    sent: tx.sent,
    txId: tx.txId,
  }
}
