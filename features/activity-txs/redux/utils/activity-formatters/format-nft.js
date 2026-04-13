import { TX_TYPES } from '../../constants/tx-types.js'
import { isPending } from './format-tx-activity.js'
import { getSharedProps } from './get-shared-props.js'

const determineNftSent = (nft, tx) => {
  if (tx) {
    if (tx.received !== undefined) {
      return !tx.received
    }

    if (tx.coinAmount) {
      return !tx.coinAmount.isPositive
    }
  }

  if (nft.sent !== undefined) {
    return nft.sent
  }

  return false
}

export const formatUnindexedNftTx = ({ assetName, nftTx }) => {
  const sent = nftTx.sent === undefined ? false : nftTx.sent

  return {
    ...getSharedProps({
      txId: nftTx.txId,
      date: new Date(nftTx.date),
      assetName,
      type: TX_TYPES.NFT,
      id: `nft.${assetName}.${nftTx.txId}`,
      pending: false,
      failed: false,
      sent,
      received: !sent,
    }),
    nft: nftTx,
  }
}

export const formatNftTx = ({ tx, nft, assetName, asset, ...rest }) => {
  const sent = determineNftSent(nft, tx)

  return {
    ...rest,
    ...getSharedProps({
      txId: nft.txId,
      date: tx.date,
      assetName,
      type: TX_TYPES.NFT,
      id: `nft.${assetName}.${tx.txId}`,
      pending: isPending(tx, asset),
      failed: !!tx.failed,
      sent,
      received: !sent,
    }),
    nft,
    tx,
  }
}
