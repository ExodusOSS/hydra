import { createSelector } from 'reselect'
import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file

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
