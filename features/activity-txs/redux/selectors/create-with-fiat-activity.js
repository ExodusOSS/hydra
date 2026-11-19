import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'
import assert from 'minimalistic-assert'
import { TX_TYPES } from '../constants/tx-types.js'
import { FIAT_ORDER } from '@exodus/models'

const { ORDER_STATUS, ORDER_TYPES } = FIAT_ORDER

const ORDER_TX_MATCH_WINDOW_MS = 3 * 24 * 60 * 60 * 1000

const NON_MATCHABLE_ORDER_STATUSES = new Set([
  ORDER_STATUS.failed,
  ORDER_STATUS.refunded,
  ORDER_STATUS.expired,
  ORDER_STATUS.error,
])

const findMatchingOrderIndex = ({ activityItem, ordersWithoutTx }) => {
  const coinAmount = activityItem.tx?.coinAmount
  if (!coinAmount) {
    return -1
  }

  const txTime = activityItem.date?.getTime?.()
  if (!Number.isFinite(txTime)) {
    return -1
  }

  const absAmount = coinAmount.abs()

  return ordersWithoutTx.findIndex((order) => {
    const isSell = order.orderType === ORDER_TYPES.sell
    if (isSell !== activityItem.tx.sent) {
      return false
    }

    const orderAmount = isSell ? order.fromAmount : order.toAmount
    if (!orderAmount || !absAmount.equals(orderAmount)) {
      return false
    }

    const orderTime = order.date?.getTime?.()

    return Number.isFinite(orderTime) && Math.abs(txTime - orderTime) <= ORDER_TX_MATCH_WINDOW_MS
  })
}

const selectorFactory =
  (visibleOrdersSelector) =>
  ({ createActivitySelector }) => {
    assert(createActivitySelector, 'please provide activitySelector')

    return memoize(
      ({ assetName, walletAccount, displayFiatOrdersWithoutTx = false, ...rest }) => {
        const activitySelector = createActivitySelector({ assetName, walletAccount, ...rest })
        assert(activitySelector, 'createActivitySelector must return selector')
        if (visibleOrdersSelector.isFallback) return activitySelector
        return createSelector(visibleOrdersSelector, activitySelector, (fiatOrders, activity) => {
          if (!fiatOrders) {
            return activity
          }

          let hasChanges = false
          const fiatOrdersWithoutTx = []
          const matchableOrdersWithoutTx = []

          if (displayFiatOrdersWithoutTx) {
            for (const order of fiatOrders) {
              if (order.txId) continue

              const isRelatedBuyOrder =
                order.toWalletAccount === walletAccount && order.toAsset === assetName
              const isRelatedSellOrder =
                order.fromWalletAccount === walletAccount && order.fromAsset === assetName

              if (isRelatedBuyOrder || isRelatedSellOrder) {
                fiatOrdersWithoutTx.push(order)
                if (!NON_MATCHABLE_ORDER_STATUSES.has(order.exodusStatus)) {
                  matchableOrdersWithoutTx.push(order)
                }
              }
            }
          }

          const resultActivity = []

          for (const activityItem of activity) {
            const fiatOrdersByTx = fiatOrders.getAllByTxId(activityItem.txId)

            if (fiatOrdersByTx.length > 0) {
              hasChanges = true

              for (const fiatOrder of fiatOrdersByTx) {
                resultActivity.push({
                  ...activityItem,
                  fiatOrder,
                  id: `${activityItem.id}.${fiatOrder.orderId}`,
                  type: TX_TYPES.FIAT,
                })
              }

              continue
            }

            if (matchableOrdersWithoutTx.length > 0) {
              const matchingOrderIndex = findMatchingOrderIndex({
                activityItem,
                ordersWithoutTx: matchableOrdersWithoutTx,
              })

              if (matchingOrderIndex !== -1) {
                matchableOrdersWithoutTx.splice(matchingOrderIndex, 1)
                hasChanges = true
                continue
              }
            }

            resultActivity.push(activityItem)
          }

          for (const fiatOrder of fiatOrdersWithoutTx) {
            hasChanges = true
            resultActivity.push({
              id: `${assetName}.fiat-order-without-tx.${fiatOrder.orderId}`,
              assetName,
              walletAccount,
              fiatOrder,
              type: TX_TYPES.FIAT,
              pending: fiatOrder.exodusStatus === ORDER_STATUS.in_progress,
              date: fiatOrder.date || new Date(),
            })
          }

          if (!hasChanges) return activity

          return resultActivity
        })
      },
      (deps) => JSON.stringify(deps)
    )
  }

const createWithFiatActivitySelectorDefinition = {
  id: 'createWithFiatActivity',
  selectorFactory,
  dependencies: [{ module: 'fiatRamp', selector: 'visibleOrders', optional: true }],
}

export default createWithFiatActivitySelectorDefinition
