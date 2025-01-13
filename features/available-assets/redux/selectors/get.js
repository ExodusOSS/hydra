import lodash from 'lodash'
import { createSelector } from 'reselect'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const selectorFactory = (allAvailableAssetsSelector) =>
  createSelector(allAvailableAssetsSelector, (allAvailableAssets) =>
    memoize((assetName) => allAvailableAssets[assetName])
  )

const getSelectorDefinition = {
  id: 'get',
  selectorFactory,
  dependencies: [{ selector: 'all' }],
}

export default getSelectorDefinition
