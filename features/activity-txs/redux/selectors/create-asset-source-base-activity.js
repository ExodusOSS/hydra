import { createSelector } from 'reselect'
import { memoize } from '@exodus/basic-utils'
import { formattersByType } from '../utils/activity-formatters'
import { formatUnindexedOrder } from '../utils/activity-formatters/format-swap-activity'

const EMPTY = Object.freeze([])

const groupTxsWithSameOrder = ({ txs, orderSet, isIndexless }) => {
  if (!orderSet) return txs.map((tx) => ({ tx, type: 'tx' }))

  const getOrder = (tx) => orderSet.getByTxId(tx.txId)
  const exchangeByOrderId = new Map()
  const result = []

  for (const tx of txs) {
    const order = getOrder(tx)
    if (isIndexless && order) {
      // Orders are the source of truth for indexless swaps.
      // Skip this tx and add it later as exchanged.
      continue
    }

    if (order) {
      if (!exchangeByOrderId.has(order.orderId)) {
        exchangeByOrderId.set(order.orderId, [])
      }

      exchangeByOrderId.get(order.orderId).push(tx)
    } else {
      result.push({ tx, type: 'tx' })
    }
  }

  exchangeByOrderId.forEach((txsGroup) => {
    const tx = txsGroup.sort((a, b) => b.date.getTime() - a.date.getTime())[0]
    const order = getOrder(tx)
    result.push({ tx, type: 'exchange', order })
  })

  return result
}

const noop = () => null

const createAssetSourceBaseActivitySelectorDefinition = {
  id: 'createAssetSourceBaseActivity',
  selectorFactory: (
    assetsSelector,
    createBatchedAssetSourceSelector,
    createOrdersInAccountSelector,
    getPersonalNoteByTxIdSelector
  ) =>
    memoize(
      ({ assetName, walletAccount, displayOrderWithoutTx = false, ...rest }) => {
        const batchedTxsSelector = createBatchedAssetSourceSelector({
          assetName,
          walletAccount,
          ...rest,
        })
        const orderSelector = createOrdersInAccountSelector.isFallback
          ? noop
          : createOrdersInAccountSelector(walletAccount)
        return createSelector(
          assetsSelector,
          batchedTxsSelector,
          orderSelector,
          getPersonalNoteByTxIdSelector,
          (assets, txs = EMPTY, orderSet, getPersonalNoteByTxId) => {
            const activityResult = []
            const isIndexless = assets[assetName]?.baseAsset?.api?.features?.noHistory
            const groupedTxs = groupTxsWithSameOrder({ txs, orderSet, isIndexless })

            if (groupedTxs) {
              for (const group of groupedTxs) {
                const { tx, order, type: formatterType } = group
                const personalNote = getPersonalNoteByTxId
                  ? getPersonalNoteByTxId(tx.txId)
                  : undefined
                const formattedTx = formattersByType.get(formatterType)({
                  asset: assets[tx.coinName],
                  order,
                  tx,
                  personalNote,
                })

                activityResult.push(formattedTx)
              }
            }

            if (orderSet && (isIndexless || displayOrderWithoutTx)) {
              const orderIdsFromActivity = new Set(
                activityResult.map((item) => item.order?.orderId)
              )
              const ordersForIndexlessAssets = [...orderSet].filter(
                (order) =>
                  [order.fromAsset, order.toAsset].includes(assetName) &&
                  order.exodusStatus !== 'syncing'
              )

              ordersForIndexlessAssets.forEach((order) => {
                // Prevent dups by checking if this order already exists.
                if (orderIdsFromActivity.has(order.orderId)) return

                const formattedItem = formatUnindexedOrder({ assetName, assets, order })

                activityResult.push(formattedItem)
              })
            }

            if (activityResult.length === 0) return EMPTY

            return activityResult.sort((a, b) => b.date.getTime() - a.date.getTime())
          }
        )
      },
      ({ assetName, walletAccount, ...rest }) =>
        `${assetName}_${walletAccount}_${JSON.stringify(rest)}`
    ),
  dependencies: [
    { module: 'assets', selector: 'all' },
    { selector: 'createBatchedAssetSourceSelector' },
    { module: 'orders', selector: 'createOrdersInAccount', optional: true },
    { module: 'personalNotes', selector: 'get', optional: true },
  ],
}

export default createAssetSourceBaseActivitySelectorDefinition
