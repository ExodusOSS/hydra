// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import { createSelector } from 'reselect'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const selectorFactory = (assetsSelector, enabledAssetsSelector) =>
  memoize((assetName) =>
    createSelector(assetsSelector, enabledAssetsSelector, (assets, enabledAssets) => {
      if (!assetName || !assets?.[assetName]) return false
      const asset = assets[assetName]

      if (asset.isCombined) {
        const assetNames = Object.keys(enabledAssets)
        if (assetNames.length === 0) return false
        return assetNames.every((assetName) => asset.combinedAssetNames.includes(assetName))
      }

      if (!enabledAssets[assetName]) return false

      return Object.keys(enabledAssets).length === 1 && Object.keys(enabledAssets)[0] === assetName
    })
  )

const createIsOnlyEnabledSelector = {
  id: 'createIsOnlyEnabled',
  selectorFactory,
  dependencies: [{ module: 'assets', selector: 'all' }, { selector: 'data' }],
}

export default createIsOnlyEnabledSelector
