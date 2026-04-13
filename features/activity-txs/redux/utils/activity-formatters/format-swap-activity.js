import { getSharedProps } from './get-shared-props.js'
import { TX_TYPES } from '../../constants/tx-types.js'

const FINAL_ORDER_STATUS = {
  inProgress: 'in-progress',
  failed: 'failed',
  success: 'complete',
}

const EXODEX_TX_TYPES = {
  PRE_SETUP: 'preSetupTransaction',
  SETUP: 'setupTransaction',
  SWAP: 'swapTransaction',
  CLEANUP: 'cleanupTransaction',
}

const UI_TX_TYPE_FROM_EXODEX = new Map([
  [EXODEX_TX_TYPES.PRE_SETUP, TX_TYPES.APPROVAL],
  [EXODEX_TX_TYPES.SETUP, TX_TYPES.APPROVAL],
  [EXODEX_TX_TYPES.SWAP, TX_TYPES.EXCHANGE],
  [EXODEX_TX_TYPES.CLEANUP, TX_TYPES.CLEANUP],
])

function getSwapDisplayAmount({ tx, order }) {
  if (tx.coinName === order.fromAsset && order.fromAmount) return order.fromAmount.abs()
  if (tx.coinName === order.toAsset && order.toAmount) return order.toAmount.abs()
  if (tx.coinAmount?.abs) return tx.coinAmount.abs()
  return null
}

function getOrderType({ order, tx }) {
  const txInfoFromOrder = tx
    ? order.txIds?.find((txFromOrder) => txFromOrder.txId === tx.txId)
    : null
  return UI_TX_TYPE_FROM_EXODEX.get(txInfoFromOrder?.txType) || TX_TYPES.EXCHANGE
}

const getSwapSharedProps = ({
  date,
  assetName,
  txId,
  tx,
  order,
  failed,
  displayAmount,
  personalNote,
  pending,
}) => {
  return {
    ...getSharedProps({
      txId,
      date,
      id: `swap.${assetName}.${order?.orderId || txId}`,
      assetName,
      type: getOrderType({ tx, order }),
      pending,
      failed,
      sent: order.fromAsset === assetName,
      received: order.toAsset === assetName,
    }),
    tx,
    order,
    displayAmount,
    personalNote,
  }
}

export const formatSwapActivity = ({ tx, order, personalNote }) => {
  const displayAmount = getSwapDisplayAmount({ tx, order })
  if (!displayAmount) return null

  return getSwapSharedProps({
    date: tx.date,
    assetName: tx.coinName,
    txId: tx.txId,
    tx,
    order,
    failed: !!(tx.failed || order.error),
    displayAmount,
    personalNote,
    pending: order.exodusStatus === FINAL_ORDER_STATUS.inProgress,
  })
}

export const formatUnindexedOrder = ({ order, assetName: _assetName, personalNote }) => {
  const isFromIndexlessAsset = order.fromAsset === _assetName
  const assetName = isFromIndexlessAsset ? order.fromAsset : order.toAsset
  const amount = isFromIndexlessAsset ? order.fromAmount : order.toAmount
  if (!amount) return null

  const displayAmount = amount.abs()
  const txId = isFromIndexlessAsset ? order.fromTxId : order.toTxId

  return getSwapSharedProps({
    date: order.date,
    assetName,
    txId,
    order,
    failed: !!order.error,
    displayAmount,
    personalNote,
    pending: order.exodusStatus === FINAL_ORDER_STATUS.inProgress,
  })
}
