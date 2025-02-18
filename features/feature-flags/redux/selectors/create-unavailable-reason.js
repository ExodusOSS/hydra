import { createSelector } from 'reselect'
import { memoize } from '@exodus/basic-utils'

const selectorFactory = (createFeatureFlagSelector) =>
  memoize((featureFlag) =>
    createSelector(createFeatureFlagSelector(featureFlag), (data) => data?.unavailableReason)
  )

const createUnavailableReasonSelectorDefinition = {
  id: 'createUnavailableReason',
  selectorFactory,
  dependencies: [{ selector: 'create' }],
}

export default createUnavailableReasonSelectorDefinition
