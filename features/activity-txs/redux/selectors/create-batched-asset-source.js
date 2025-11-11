// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'
import { Tx } from '@exodus/models'
import { memoize } from '@exodus/basic-utils'

const { get, groupBy, merge } = lodash

// TODO: Remove in the future.
// Batch swapping transactions using personal notes is no longer needed.
// Now, we write the `order.txsIds` array, which contains information about setup, swap transactions, and more.
// An order can be matched using any transaction ID from this array.
// Each transaction will match the order, but we can deduplicate them later using `order.id` to display single activity item
const collapseBatch = ({ batch, assets }) => {
  const asset = assets[batch[0].coinName]
  const isToken = asset.baseAsset.name !== asset.name

  const totalBatchValue = batch.reduce(
    (sum, otherTx) => sum.add(otherTx.coinAmount),
    asset.currency.ZERO
  )
  const totalBatchFee = batch.reduce(
    (sum, otherTx) => (otherTx.feeAmount ? sum.add(otherTx.feeAmount) : sum),
    (isToken ? asset.baseAsset : asset).currency.ZERO
  )
  const baseData = batch[0].data || Object.create(null)
  const batchedIds = batch.map((tx) => tx.txId)

  const txJSON = batch[0].toJSON()

  return Tx.fromJSON(
    merge(Object.create(null), txJSON, {
      coinAmount: totalBatchValue,
      coinName: asset.name,
      feeAmount: totalBatchFee,
      feeCoinName: asset.feeAsset.name,
      ...(batchedIds.length > 1 && {
        data: {
          ...baseData,
          batchedIds,
        },
      }),
    })
  )
}

const groupAndCollapseBatched = ({ txs, personalNotesWithBatchId, assets }) => {
  const { NO_BATCH: unbatchedTransactions = [], ...batches } = groupBy(txs, (tx) =>
    get(personalNotesWithBatchId.get(tx.txId), 'dapp.batch.id', 'NO_BATCH')
  )
  const batchedTransactions = Object.values(batches).map((batch) =>
    collapseBatch({ batch, assets })
  )

  return [...unbatchedTransactions, ...batchedTransactions]
}

const createBatchedAssetSourceSelectorDefinition = {
  id: 'createBatchedAssetSourceSelector',
  dependencies: [
    { selector: 'createLimitedAssetSourceSelector' },
    { module: 'personalNotes', selector: 'withBatchId', optional: true },
    { module: 'assets', selector: 'all' },
  ],
  selectorFactory: (
    createLimitedAssetSourceSelector,
    personalNotesWithBatchIdSelector,
    assetsSelector
  ) =>
    memoize(
      ({ assetName, walletAccount, limit }) =>
        personalNotesWithBatchIdSelector.isFallback
          ? createLimitedAssetSourceSelector({ assetName, walletAccount, limit })
          : createSelector(
              createLimitedAssetSourceSelector({ assetName, walletAccount, limit }),
              personalNotesWithBatchIdSelector,
              assetsSelector,
              (txs, personalNotesWithBatchId, assets) => {
                return personalNotesWithBatchId.size > 0
                  ? groupAndCollapseBatched({ txs, personalNotesWithBatchId, assets })
                  : txs
              }
            ),
      ({ assetName, walletAccount, limit }) => `${assetName}_${walletAccount}_${limit}`
    ),
}

export default createBatchedAssetSourceSelectorDefinition
