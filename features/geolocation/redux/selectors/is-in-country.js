import { createSelector } from 'reselect'
import { memoize } from '@exodus/basic-utils'

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
