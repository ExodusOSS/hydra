import { createSelector } from 'reselect'
import { memoize } from '@exodus/basic-utils'
import { formattersByType } from '../utils/activity-formatters/index.js'
import { formatUnindexedOrder } from '../utils/activity-formatters/format-swap-activity.js'

const EMPTY = Object.freeze([])

const groupTxsWithSameOrder = ({ txs, orderSet, isIndexless }) => {
  if (!orderSet) return txs.map((tx) => ({ tx, type: 'tx' }))

  const getOrder = (tx) => {
    const foundOrder = orderSet.getByTxId(tx.txId)

    // If this is a base asset (fee-only tx), don't attach the order
    // Base asset is not involved in the swap itself (not fromAsset or toAsset)
    if (foundOrder) {
      const isFromAsset = tx.coinName === foundOrder.fromAsset
      const isToAsset = tx.coinName === foundOrder.toAsset

      // Base asset transactions should be treated as normal txs, not swaps
      if (!isFromAsset && !isToAsset) {
        return
      }
    }

    const isBatchedTx = tx.coinName === 'bitcoin' && tx.data.sent?.[tx.data.sentIndex]
    const isValidTx =
      isBatchedTx && foundOrder?.fromAmount
        ? tx.coinAmount.abs().equals(foundOrder.fromAmount)
        : true

    return isValidTx ? foundOrder : undefined
  }

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

                activityResult.push({ ...formattedTx, walletAccount })
              }
            }

            if (orderSet && (isIndexless || displayOrderWithoutTx)) {
              const orderIdsFromActivity = new Set(
                activityResult.map((item) => item.order?.orderId)
              )
              const ordersForIndexlessAssets = [...orderSet].filter((order) => {
                const isFromAsset =
                  order.fromAsset === assetName && order.fromWalletAccount === walletAccount
                const isToAsset =
                  order.toAsset === assetName && order.toWalletAccount === walletAccount

                const shouldDisplay =
                  isFromAsset || isToAsset || !order.fromWalletAccount || !order.toWalletAccount
                return shouldDisplay && order.exodusStatus !== 'syncing'
              })

              ordersForIndexlessAssets.forEach((order) => {
                // Prevent dups by checking if this order already exists.
                if (orderIdsFromActivity.has(order.orderId)) return

                activityResult.push({
                  ...formatUnindexedOrder({ assetName, assets, order }),
                  walletAccount,
                })
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
