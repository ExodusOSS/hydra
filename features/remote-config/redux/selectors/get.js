import { memoize } from '@exodus/basic-utils'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
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
