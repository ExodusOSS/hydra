import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'
import assert from 'minimalistic-assert'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

const { uniqBy } = lodash

const selectorFactory =
  () =>
  ({ createAssetSourceActivitySelector, dedupExchange = true }) => {
    assert(
      createAssetSourceActivitySelector,
      'please provide createAssetSourceActivitySelector selector factory'
    )

    return memoize(
      ({ assetNames, walletAccounts, ...rest }) => {
        const selectors = []
        for (const assetName of assetNames) {
          for (const walletAccount of walletAccounts) {
            selectors.push(
              createAssetSourceActivitySelector({
                assetName,
                walletAccount,
                ...rest,
              })
            )
          }
        }

        return createSelector(...selectors, (...activities) => {
          const ordersIncluded = new Set()
          let result = activities.flat()
          if (dedupExchange) {
            result = result.filter((activityItem) => {
              const { order } = activityItem
              const orderId = order?.orderId
              if (orderId) {
                if (!ordersIncluded.has(orderId)) {
                  ordersIncluded.add(orderId)
                  return true
                }

                return false
              }

              return true
            })
          }

          result = uniqBy(result, 'id')
          return result.sort((a, b) => (b.date === a.date ? 0 : b.date > a.date ? 1 : -1))
        })
      },
      ({ assetNames, walletAccounts, ...rest }) =>
        `${assetNames.join(',')}_${walletAccounts.join(',')}_${JSON.stringify(rest)}`
    )
  }

const createMultiActivitySelectorDefinition = {
  id: 'createMultiActivity',
  selectorFactory,
  dependencies: [],
}

export default createMultiActivitySelectorDefinition
