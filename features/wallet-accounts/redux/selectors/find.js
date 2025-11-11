// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const findSelectorFactory = (filterSelector) =>
  memoize(
    (condition = {}) =>
      createSelector(filterSelector(condition), (filter) => {
        return filter[0]
      }),
    (options) => JSON.stringify(options)
  )

const findSelectorDefinition = {
  id: 'find',
  selectorFactory: findSelectorFactory,
  dependencies: [
    //
    { selector: 'filter' },
  ],
}

export default findSelectorDefinition
