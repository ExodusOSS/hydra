import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'

const selectorFactory = (dataSelector) =>
  memoize((featureFlag) => createSelector(dataSelector, (data) => data[featureFlag]))

const createSelectorDefinition = {
  id: 'create',
  selectorFactory,
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export default createSelectorDefinition
