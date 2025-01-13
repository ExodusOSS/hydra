import { createSelector } from 'reselect'
import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file

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
