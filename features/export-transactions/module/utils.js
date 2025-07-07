export const formatTransactionOutput = ({
  tx,
  type,
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
  const isWithdrawal = type === 'withdrawal'
  const isStaked = type === 'staked'
  const isUnstakedOrClaimed = ['unstaked', 'claimed'].includes(type)

  return {
    date: tx.date,
    type: `${type}${tx.error ? ' (failed)' : ''}`,
    fromPortfolio: tx.sent ? walletAccount : oppositeWalletAccount,
    toPortfolio: tx.sent ? oppositeWalletAccount : walletAccount,
    outAmount: isWithdrawal || isStaked ? coinAmountOutput : '',
    outCurrency: isWithdrawal || isStaked ? coinCurrency : '',
    feeAmount: isWithdrawal || !feeAmount?.isZero ? feeAmountOutput : '',
    feeCurrency: isWithdrawal || !feeAmount?.isZero ? feeCurrency : '',
    fromAddress: [tx.from].flat().join(' | '),
    toAddress: [tx.to].flat().join(' | '),
    outTxId: isWithdrawal || isStaked ? tx.txId : '',
    outTxUrl: isWithdrawal || isStaked ? asset.blockExplorer.txUrl(tx.txId) : '',
    inAmount: isWithdrawal || isUnstakedOrClaimed ? '' : coinAmountOutput,
    inCurrency: isWithdrawal || isUnstakedOrClaimed ? '' : coinCurrency,
    inTxId: isWithdrawal || isUnstakedOrClaimed ? '' : tx.txId,
    inTxUrl: isWithdrawal || isUnstakedOrClaimed ? '' : asset.blockExplorer.txUrl(tx.txId),
    personalNote: personalNote?.getMessage({ to: tx.to }),

    tokens: tx.tokens.join(' '),

    // used later, not exported
    sent: tx.sent,
    txId: tx.txId,
  }
}
