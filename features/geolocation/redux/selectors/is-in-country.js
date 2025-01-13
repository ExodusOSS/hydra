import { createSelector } from 'reselect'
import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file

const selectorFactory = (dataSelector) =>
  memoize((countryCode) =>
    createSelector(
      dataSelector,
      (data) => !!countryCode && data.countryCode?.toLowerCase() === countryCode?.toLowerCase()
    )
  )

const isInCountrySelectorDefinition = {
  id: 'isInCountry',
  selectorFactory,
  dependencies: [{ selector: 'data' }],
}

export default isInCountrySelectorDefinition
