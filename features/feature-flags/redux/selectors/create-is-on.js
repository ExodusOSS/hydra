import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'

const selectorFactory = (createFeatureFlagSelector) =>
  memoize((featureFlag) =>
    createSelector(createFeatureFlagSelector(featureFlag), (data) => data?.isOn || false)
  )

const createIsOnSelectorDefinition = {
  id: 'createIsOn',
  selectorFactory,
  dependencies: [
    //
    { selector: 'create' },
  ],
}

export default createIsOnSelectorDefinition
