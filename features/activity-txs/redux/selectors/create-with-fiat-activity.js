import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'
import assert from 'minimalistic-assert'
import { TX_TYPES } from '../constants/tx-types'

const selectorFactory =
  (visibleOrdersSelector, assetsSelector) =>
  ({ createActivitySelector }) => {
    assert(createActivitySelector, 'please provide activitySelector')

    return memoize(
      ({ assetName, walletAccount, ...rest }) => {
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
              const fiatOrder = fiatOrders.getByTxId(activityItem.txId)

              if (fiatOrder) {
                hasChanges = true
                resultActivity.push({
                  ...activityItem,
                  fiatOrder,
                  type: TX_TYPES.FIAT,
                })
              } else {
                resultActivity.push(activityItem)
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
