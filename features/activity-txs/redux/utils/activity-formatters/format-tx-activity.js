import { TX_TYPES } from '../../constants/tx-types.js'
import { getSharedProps } from './get-shared-props.js'

function getTxType({ tx }) {
  return tx.sent ? TX_TYPES.SENT : TX_TYPES.RECEIVED
}

const getMinConfirmations = (asset) => asset.baseAsset.minConfirmations || 1

export function isPending(tx, asset) {
  return (
    tx.confirmations < getMinConfirmations(asset) &&
    !tx.dropped && // dropped txs are not pending anymore
    !tx.error // errored txs are not pending anymore
  )
}

const generateTxActivityId = ({ tx, asset }) => {
  const index = tx.data?.activityIndex

  return index ? `${asset.name}.${tx.txId}_${index}` : `${asset.name}.${tx.txId}`
}

export const formatTxActivity = ({ tx, asset, personalNote }) => {
  return {
    ...getSharedProps({
      txId: tx.txId,
      date: tx.date,
      id: generateTxActivityId({ tx, asset }),
      assetName: asset.name,
      type: getTxType({ tx }),
      pending: isPending(tx, asset),
      failed: !!tx.failed,
      sent: tx.sent,
      received: tx.received,
    }),
    tx,
    personalNote,
  }
}
