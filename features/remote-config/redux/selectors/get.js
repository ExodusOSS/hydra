import { memoize, get } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
import { createSelector } from 'reselect'

const selectorFactory = (dataSelector) =>
  memoize((path) => createSelector(dataSelector, (data) => get(data, path)))

const getSelectorDefinition = {
  id: 'get',
  selectorFactory,
  dependencies: [
    //
    { selector: 'data' },
  ],
}

export default getSelectorDefinition
