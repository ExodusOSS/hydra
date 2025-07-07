import { NFTS_NETWORK_TO_ASSET_NAME } from '../../constants/index.js'
import { isSentTx } from './utils.js'

const resultFunction = (txsByWalletAccount) => {
  const allTxs = Object.entries(txsByWalletAccount).flatMap(([_, txsByNetwork]) =>
    Object.entries(txsByNetwork).flatMap(([network, txs]) => {
      const assetName = NFTS_NETWORK_TO_ASSET_NAME[network]
      if (!assetName || !txs?.length) return []

      return txs.filter(Boolean).map((tx) => ({
        ...tx,
        network,
        sent: isSentTx({ tx, network }),
      }))
    })
  )

  return new Map(allTxs.map((nftTx) => [nftTx.txId, nftTx]))
}

const txsByIdSelectorDefinition = {
  id: 'txsById',
  resultFunction,
  dependencies: [
    //
    { selector: 'txsData' },
  ],
}

export default txsByIdSelectorDefinition
