// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'

const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

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
