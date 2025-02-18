import { memoize } from '@exodus/basic-utils'
import lodash from 'lodash'
import { createSelector } from 'reselect'

const selectorFactory = (dataSelector) =>
  memoize((path) => createSelector(dataSelector, (data) => lodash.get(data, path)))

const getSelectorDefinition = {
  id: 'get',
  selectorFactory,
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export default getSelectorDefinition
