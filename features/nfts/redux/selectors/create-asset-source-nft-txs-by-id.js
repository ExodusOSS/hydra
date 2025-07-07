import { memoize } from '@exodus/basic-utils'
import { ASSET_NAME_TO_NFTS_NETWORK } from '../../constants/index.js'
import { createSelector } from 'reselect'
import { isSentTx } from './utils.js'

const createAssetSourceNftTxsByIdSelectorDefinition = {
  id: 'createAssetSourceNftTxsById',
  dependencies: [
    //
    { selector: 'txsData' },
  ],
  selectorFactory: (txsDataSelector) =>
    memoize(
      ({ assetName, walletAccount }) =>
        createSelector(txsDataSelector, (txsByWalletAccount) => {
          const network = ASSET_NAME_TO_NFTS_NETWORK[assetName]
          if (!txsByWalletAccount[walletAccount]?.[network]) {
            return new Map()
          }

          const txs = txsByWalletAccount[walletAccount][network].filter(Boolean).map((tx) => ({
            ...tx,
            network,
            sent: isSentTx({ tx, network }),
          }))

          return new Map(txs.map((nftTx) => [nftTx.txId, nftTx]))
        }),
      ({ assetName, walletAccount }) => `${assetName}|${walletAccount}`
    ),
}

export default createAssetSourceNftTxsByIdSelectorDefinition
