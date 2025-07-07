import { getSharedProps } from './get-shared-props.js'
import { TX_TYPES } from '../../constants/tx-types.js'
import { isPending } from './format-tx-activity.js'

export const formatUnindexedNftTx = ({ assetName, nftTx }) => {
  return {
    ...getSharedProps({
      txId: nftTx.txId,
      date: new Date(nftTx.date),
      assetName,
      type: TX_TYPES.NFT,
      id: `nft.${assetName}.${nftTx.txId}`,
      pending: false,
      failed: false,
      sent: nftTx.sent || false,
      received: !nftTx.sent,
    }),
    nft: nftTx,
  }
}

export const formatNftTx = ({ tx, nft, assetName, asset, ...rest }) => {
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
      sent: nft.sent || false,
      received: !nft.sent,
    }),
    nft,
    tx,
  }
}
