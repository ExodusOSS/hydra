// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

const { memoize } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const resultFunction = (assets, enabledAssets) =>
  memoize((assetName) => {
    if (!assetName || !assets?.[assetName]) return false
    const asset = assets[assetName]

    if (asset.isCombined) {
      const assetNames = Object.keys(enabledAssets)
      if (assetNames.length === 0) return false
      return assetNames.every((assetName) => asset.combinedAssetNames.includes(assetName))
    }

    if (!enabledAssets[assetName]) return false

    return Object.values(enabledAssets).filter(Boolean).length === 1
  })

const getIsOnlyEnabledSelector = {
  id: 'getIsOnlyEnabled',
  resultFunction,
  dependencies: [{ module: 'assets', selector: 'all' }, { selector: 'data' }],
}

export default getIsOnlyEnabledSelector
