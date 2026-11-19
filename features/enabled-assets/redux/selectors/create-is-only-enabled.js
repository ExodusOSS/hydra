// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'

const { memoize } = lodash // oxlint-disable-line @exodus/oxlint-plugin-restricted-imports/prefer-basic-utils

const selectorFactory = (createAssetSelector, enabledAssetsSelector) =>
  memoize((assetName) =>
    createSelector(
      createAssetSelector(assetName),
      enabledAssetsSelector,
      (asset, enabledAssets) => {
        if (!asset) return false

        if (asset.isCombined) {
          const assetNames = Object.keys(enabledAssets)
          if (assetNames.length === 0) return false
          return assetNames.every((assetName) => asset.combinedAssetNames.includes(assetName))
        }

        if (!enabledAssets[assetName]) return false

        return (
          Object.keys(enabledAssets).length === 1 && Object.keys(enabledAssets)[0] === assetName
        )
      }
    )
  )

const createIsOnlyEnabledSelector = {
  id: 'createIsOnlyEnabled',
  selectorFactory,
  dependencies: [{ module: 'assets', selector: 'createAssetSelector' }, { selector: 'data' }],
}

export default createIsOnlyEnabledSelector
