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

  const toAddresses = [
    ...new Set([tx.to, tx?.data?.sent?.map((send) => send.address)].flat().filter(Boolean)),
  ]
  // no point duplicating identical personal notes
  const personalNotes = [
    ...new Set(
      [
        personalNote?.getMessage(),
        ...toAddresses.map((address) => personalNote?.getMessage({ to: address })),
      ].filter(Boolean)
    ),
  ]

  const useOutTx = (isWithdrawal || isStaked) && !isUnstakedOrClaimed
  const useInTx = (!isWithdrawal && !isStaked) || isUnstakedOrClaimed

  return {
    date: tx.date,
    type: `${type}${tx.error ? ' (failed)' : ''}`,
    fromPortfolio: tx.sent ? walletAccount : oppositeWalletAccount,
    toPortfolio: tx.sent ? oppositeWalletAccount : walletAccount,
    outAmount: useOutTx ? coinAmountOutput : '',
    outCurrency: useOutTx ? coinCurrency : '',
    feeAmount: isWithdrawal || !feeAmount?.isZero ? feeAmountOutput : '',
    feeCurrency: isWithdrawal || !feeAmount?.isZero ? feeCurrency : '',
    fromAddress: [...new Set([tx.from].flat().filter(Boolean))].join(' | '),
    toAddress: toAddresses.join(' | '),
    outTxId: useOutTx ? tx.txId : '',
    outTxUrl: useOutTx ? asset.blockExplorer.txUrl(tx.txId) : '',
    inAmount: useInTx ? coinAmountOutput : '',
    inCurrency: useInTx ? coinCurrency : '',
    inTxId: useInTx ? tx.txId : '',
    inTxUrl: useInTx ? asset.blockExplorer.txUrl(tx.txId) : '',
    personalNote: personalNotes.length > 0 ? personalNotes.join(' | ') : undefined,

    tokens: tx.tokens.join(' '),

    // used later, not exported
    sent: tx.sent,
    txId: tx.txId,
  }
}
