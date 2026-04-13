import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'
import assert from 'minimalistic-assert'
import { TX_TYPES } from '../constants/tx-types.js'
import { ORDER_STATUS, ORDER_TYPES } from '@exodus/models/lib/fiat-order/constants.js'

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
          const pendingFiatOrdersWithoutTx = []
          const fiatOrdersWithoutTx = []

          if (displayFiatOrdersWithoutTx) {
            for (const order of fiatOrders) {
              if (order.txId) continue

              const isRelatedBuyOrder =
                order.toWalletAccount === walletAccount && order.toAsset === assetName
              const isRelatedSellOrder =
                order.fromWalletAccount === walletAccount && order.fromAsset === assetName

              if (isRelatedBuyOrder || isRelatedSellOrder) {
                fiatOrdersWithoutTx.push(order)
                if (order.exodusStatus === ORDER_STATUS.in_progress) {
                  pendingFiatOrdersWithoutTx.push(order)
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
            } else {
              if (activityItem.pending && pendingFiatOrdersWithoutTx.length > 0) {
                const matchingOrderIndex = pendingFiatOrdersWithoutTx.findIndex((order) => {
                  const orderAmount =
                    order.orderType === ORDER_TYPES.sell ? order.fromAmount : order.toAmount

                  return activityItem.tx?.coinAmount?.abs().equals(orderAmount)
                })

                if (matchingOrderIndex !== -1) {
                  hasChanges = true
                  pendingFiatOrdersWithoutTx.splice(matchingOrderIndex, 1)
                  continue
                }
              }

              resultActivity.push(activityItem)
            }
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
