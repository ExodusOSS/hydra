import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'
import assert from 'minimalistic-assert'
import { TX_TYPES } from '../constants/tx-types.js'
import { ORDER_STATUS } from '@exodus/models/lib/fiat-order/constants.js'

const selectorFactory =
  (visibleOrdersSelector, assetsSelector) =>
  ({ createActivitySelector }) => {
    assert(createActivitySelector, 'please provide activitySelector')

    return memoize(
      ({ assetName, walletAccount, displayFiatOrdersWithoutTx = false, ...rest }) => {
        const activitySelector = createActivitySelector({ assetName, walletAccount, ...rest })
        assert(activitySelector, 'createActivitySelector must return selector')
        if (visibleOrdersSelector.isFallback) return activitySelector
        return createSelector(
          visibleOrdersSelector,
          assetsSelector,
          activitySelector,
          (fiatOrders, assets, activity) => {
            if (!fiatOrders) {
              return activity
            }

            let hasChanges = false

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
                resultActivity.push(activityItem)
              }
            }

            if (displayFiatOrdersWithoutTx) {
              for (const fiatOrder of fiatOrders) {
                const isOrderWithoutTx = !fiatOrder.txId
                const isRelatedBuyOrder =
                  fiatOrder.toWalletAccount === walletAccount && fiatOrder.toAsset === assetName
                const isRelatedSellOrder =
                  fiatOrder.fromWalletAccount === walletAccount && fiatOrder.fromAsset === assetName

                if (isOrderWithoutTx && (isRelatedBuyOrder || isRelatedSellOrder)) {
                  hasChanges = true
                  const activityItem = {
                    id: `${assetName}.fiat-order-without-tx.${fiatOrder.orderId}`,
                    assetName,
                    walletAccount,
                    fiatOrder,
                    type: TX_TYPES.FIAT,
                    pending: fiatOrder.exodusStatus === ORDER_STATUS.in_progress,
                    date: fiatOrder.date || new Date(),
                  }
                  resultActivity.push(activityItem)
                }
              }
            }

            if (!hasChanges) return activity

            return resultActivity
          }
        )
      },
      (deps) => JSON.stringify(deps)
    )
  }

const createWithFiatActivitySelectorDefinition = {
  id: 'createWithFiatActivity',
  selectorFactory,
  dependencies: [
    { module: 'fiatRamp', selector: 'visibleOrders', optional: true },
    { module: 'assets', selector: 'all' },
  ],
}

export default createWithFiatActivitySelectorDefinition
