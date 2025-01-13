import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
import { ASSET_NAME_TO_NFTS_NETWORK } from '../../constants'
import { createSelector } from 'reselect'
import { isSentTx } from './utils'

const createAssetSourceNftTxsByIdSelectorDefinition = {
  id: 'createAssetSourceNftTxsById',
  dependencies: [
    //
    { selector: 'txsData' },
  ],
  selectorFactory: (txsDataSelector) =>
    memoize(({ assetName, walletAccount }) =>
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
      })
    ),
}

export default createAssetSourceNftTxsByIdSelectorDefinition
