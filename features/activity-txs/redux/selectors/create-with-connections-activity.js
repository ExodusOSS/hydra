import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'
import assert from 'minimalistic-assert'

const selectorFactory =
  (getConnectedOriginsSelector) =>
  ({ createActivitySelector }) => {
    assert(createActivitySelector, 'please provide activitySelector')

    return memoize(
      ({ assetName, walletAccount, ...rest }) => {
        const activitySelector = createActivitySelector({ assetName, walletAccount, ...rest })
        assert(activitySelector, 'createActivitySelector must return selector')
        if (getConnectedOriginsSelector.isFallback) return activitySelector
        return createSelector(
          getConnectedOriginsSelector,
          activitySelector,
          (getConnectedOrigins, activity) => {
            if (!getConnectedOrigins) return activity
            let hasChanges = false

            const resultActivity = []
            for (const activityItem of activity) {
              const personalNote = activityItem.personalNote
              const origin = personalNote?.providerData?.origin
              const connection = origin ? getConnectedOrigins(origin) : null
              if (connection) {
                hasChanges = true
                resultActivity.push({
                  ...activityItem,
                  connection,
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

const createWithConnectionsActivitySelectorDefinition = {
  id: 'createWithConnectionsActivity',
  selectorFactory,
  dependencies: [{ module: 'connectedOrigins', selector: 'get', optional: true }],
}

export default createWithConnectionsActivitySelectorDefinition
