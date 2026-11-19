// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { mapValues } from '@exodus/basic-utils'
import { Tx, TxSet } from '@exodus/models'
import type { Asset, AssetsByName, TxInput } from '../types.js'

const { uniqBy } = lodash

export const createTxSet = ({
  txs,
  coinName,
  assets,
}: {
  txs: readonly TxInput[]
  coinName: string
  assets: AssetsByName
}): TxSet => {
  const values = txs.map(
    (tx) =>
      tx instanceof Tx
        ? tx
        : Tx.fromJSON({
            ...tx,
            // TODO: remove when all code learns how to add coinName explicitly
            ...(tx.coinName ? {} : { coinName }),
            // TODO: remove when all code learns how to add currencies explicitly
            ...(tx.currencies ? {} : { currencies: currenciesForAsset(assets[coinName]!) }),
          } as Parameters<typeof Tx.fromJSON>[0]) // allow: cast; TxInput admits SerializedTx (TxSet.toJSON output), which Tx.fromJSON accepts at runtime but omits from its declared parameter union — alt: widening the upstream @exodus/models signature
  )
  return TxSet.fromArray(values)
}

// copied from: https://github.com/ExodusMovement/exodus-core/blob/24a359b90bfea80a808e5809e7ac4206b773e525/packages/models/src/tx/utils.js#L43
// After we are all upgraded to @exodus/models v 10, this can be imported from that library.
// For now it is copied to ensure compatibility with older library versions

// Returns name+currency refs only — `feeAsset` is AbstractAsset in the
// canonical types (no `api`), and currenciesForAsset reads just `.currency`.
type AssetRefsByName = Record<string, Pick<Asset, 'name' | 'currency'>>

function assetsForAsset(asset: Asset): AssetRefsByName {
  return Object.fromEntries(
    uniqBy([asset, asset.baseAsset, asset.feeAsset], (asset) => asset.name).map((asset) => [
      asset.name,
      asset,
    ])
  )
}

// Helper for populating the constructor 'currencies' argument
function currenciesForAsset(asset: Asset) {
  return mapValues(assetsForAsset(asset), (asset) => asset.currency)
}
