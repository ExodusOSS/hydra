import lodash from 'lodash'
import { mapValues } from '@exodus/basic-utils'
import { Tx, TxSet } from '@exodus/models'

const { uniqBy } = lodash

export const createTxSet = ({ txs, coinName, assets }) => {
  const values = txs.map((tx) =>
    tx instanceof Tx
      ? tx
      : Tx.fromJSON({
          ...tx,
          // TODO: remove when all code learns how to add coinName explicitly
          ...(tx.coinName ? {} : { coinName }),
          // TODO: remove when all code learns how to add currencies explicitly
          ...(tx.currencies ? {} : { currencies: currenciesForAsset(assets[coinName]) }),
        })
  )
  return TxSet.fromArray(values)
}

// copied from: https://github.com/ExodusMovement/exodus-core/blob/24a359b90bfea80a808e5809e7ac4206b773e525/packages/models/src/tx/utils.js#L43
// After we are all upgraded to @exodus/models v 10, this can be imported from that library.
// For now it is copied to ensure compatibility with older library versions

function assetsForAsset(asset) {
  return Object.fromEntries(
    uniqBy([asset, asset.baseAsset, asset.feeAsset], (asset) => asset.name).map((asset) => [
      asset.name,
      asset,
    ])
  )
}

// Helper for populating the constructor 'currencies' argument
function currenciesForAsset(asset) {
  return mapValues(assetsForAsset(asset), (asset) => asset.currency)
}
