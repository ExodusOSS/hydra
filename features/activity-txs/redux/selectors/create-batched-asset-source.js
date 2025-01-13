import { memoize, get, groupBy, merge } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
import { createSelector } from 'reselect'
import { Tx } from '@exodus/models'

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
