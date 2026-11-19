import { createSelector } from 'reselect'
import { memoize } from '@exodus/basic-utils'
import { formattersByType } from '../utils/activity-formatters/index.js'
import {
  EXODEX_TX_TYPES,
  formatUnindexedOrder,
} from '../utils/activity-formatters/format-swap-activity.js'

const EMPTY = Object.freeze([])

const CHAINED_SVC = 'chained'

// Outcomes of classifying a tx against the order set:
// - 'exchange': tx belongs to a swap and should be grouped into an exchange row
// - 'tx': tx is a plain send/receive (or a base-asset fee tx) and shows on its own
// - 'suppress': tx is the intermediate (bridge) leg of a chained swap and is hidden
const classifyTx = ({ tx, orderSet }) => {
  const foundOrder = orderSet.getByTxId(tx.txId)
  if (!foundOrder) return { type: 'tx' }

  const isFromAsset = tx.coinName === foundOrder.fromAsset
  const isToAsset = tx.coinName === foundOrder.toAsset

  // The tx is linked to an order but moves an asset that is neither the
  // swap's source nor destination.
  if (!isFromAsset && !isToAsset) {
    // Chained swaps (e.g. XO -> USDC -> Ondo) route through a bridge asset that
    // briefly lands in the user's wallet on the same on-chain txs as the first
    // and last legs. Those bridge-side rows (e.g. USDC received then sent) are
    // noise: the swap already appears end-to-end as fromAsset -> toAsset. Hide
    // them so users don't think they received an unrelated asset.
    //
    // Only suppress an actual bridge *movement* (non-zero principal). A
    // base-asset fee-only tx (e.g. ETH/SOL gas debit) is also "neither from nor
    // to asset", but it is a real one-way balance change, so it must stay
    // visible — hiding it would drop the base-asset balance with no activity row.
    const isBridgeMovement = Boolean(tx.coinAmount) && !tx.coinAmount.isZero

    // Only hide bridge legs once the chained swap has completed. The "noise"
    // justification relies on the bridge being a round-trip that nets to zero
    // (received on leg 1, sent on leg 2). While the order is in progress or has
    // failed/refunded, the user may genuinely be holding the bridge asset, so
    // the movement must stay visible — otherwise the balance changes with no
    // activity row explaining where the asset came from.
    const isCompleted = foundOrder.exodusStatus === 'complete'
    if (foundOrder.svc === CHAINED_SVC && isBridgeMovement && isCompleted) {
      return { type: 'suppress' }
    }

    // Otherwise this is a base-asset (fee-only) tx, shown as a normal tx.
    return { type: 'tx' }
  }

  const isBatchedTx = tx.coinName === 'bitcoin' && tx.data.sent?.[tx.data.sentIndex]
  const isValidTx =
    isBatchedTx && foundOrder?.fromAmount ? tx.coinAmount.abs().equals(foundOrder.fromAmount) : true

  return isValidTx ? { type: 'exchange', order: foundOrder } : { type: 'tx' }
}

const bridgeAmountKey = (tx) =>
  tx.coinAmount ? `${tx.coinName}:${tx.coinAmount.abs().toBaseString()}` : undefined

const amountSign = (tx) => (tx.coinAmount.toBaseString().startsWith('-') ? -1 : 1)

const groupTxsWithSameOrder = ({ txs, orderSet, isIndexless }) => {
  const txList = Array.isArray(txs) ? txs : [...txs]
  if (!orderSet) return txList.map((tx) => ({ tx, type: 'tx' }))

  const classifiedTxs = txList.map((tx) => ({ tx, ...classifyTx({ tx, orderSet }) }))

  const orphanCounterparts = []
  for (const { tx, type } of classifiedTxs) {
    if (type !== 'suppress' || !tx.coinAmount) continue
    const order = orderSet.getByTxId(tx.txId)
    if (!order || order.fromTxId !== order.toTxId) continue
    const key = bridgeAmountKey(tx)
    if (key) orphanCounterparts.push({ key, sign: amountSign(tx), used: false })
  }

  const isOrphanedBridgeLeg = (tx) => {
    if (orphanCounterparts.length === 0 || !tx.coinAmount) return false
    if (orderSet.getByTxId(tx.txId)) return false
    const key = bridgeAmountKey(tx)
    if (!key) return false
    const sign = amountSign(tx)
    const match = orphanCounterparts.find((c) => !c.used && c.key === key && c.sign === -sign)
    if (!match) return false
    match.used = true
    return true
  }

  const exchangeByOrderId = new Map()
  const result = []

  for (const { tx, type, order } of classifiedTxs) {
    if (type === 'suppress') {
      // Bridge leg of a chained swap, intentionally omitted from activity.
      continue
    }

    if (type === 'tx' && isOrphanedBridgeLeg(tx)) {
      continue
    }

    if (isIndexless && order) {
      // Orders are the source of truth for indexless swaps.
      // Skip this tx and add it later as exchanged.
      continue
    }

    if (order) {
      if (!exchangeByOrderId.has(order.orderId)) {
        exchangeByOrderId.set(order.orderId, { order, txs: [] })
      }

      exchangeByOrderId.get(order.orderId).txs.push(tx)
    } else {
      result.push({ tx, type: 'tx' })
    }
  }

  exchangeByOrderId.forEach(({ order, txs: txsGroup }) => {
    const sortedByDateDesc = txsGroup.sort((a, b) => b.date.getTime() - a.date.getTime())
    const swapLeg = sortedByDateDesc.find(
      (tx) =>
        order.txIds?.find((txFromOrder) => txFromOrder.txId === tx.txId)?.txType ===
        EXODEX_TX_TYPES.SWAP
    )
    result.push({ tx: swapLeg ?? sortedByDateDesc[0], type: 'exchange', order })
  })

  return result
}

const noop = () => null

const createAssetSourceBaseActivitySelectorDefinition = {
  id: 'createAssetSourceBaseActivity',
  selectorFactory: (
    getAssetSelector,
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
          getAssetSelector,
          batchedTxsSelector,
          orderSelector,
          getPersonalNoteByTxIdSelector,
          (getAsset, txs = EMPTY, orderSet, getPersonalNoteByTxId) => {
            const activityResult = []
            const isIndexless =
              assetName && getAsset(assetName)?.baseAsset?.api?.features?.noHistory
            const groupedTxs = groupTxsWithSameOrder({ txs, orderSet, isIndexless })

            if (groupedTxs) {
              for (const group of groupedTxs) {
                const { tx, order, type: formatterType } = group
                const personalNote = getPersonalNoteByTxId
                  ? getPersonalNoteByTxId(tx.txId)
                  : undefined
                const formattedTx = formattersByType.get(formatterType)({
                  asset: getAsset(tx.coinName),
                  order,
                  tx,
                  personalNote,
                })
                if (!formattedTx) continue

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

                const formattedOrder = formatUnindexedOrder({ assetName, order })
                if (!formattedOrder) return

                activityResult.push({
                  ...formattedOrder,
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
    { module: 'assets', selector: 'getAsset' },
    { selector: 'createBatchedAssetSourceSelector' },
    { module: 'orders', selector: 'createOrdersInAccount', optional: true },
    { module: 'personalNotes', selector: 'get', optional: true },
  ],
}

export default createAssetSourceBaseActivitySelectorDefinition
