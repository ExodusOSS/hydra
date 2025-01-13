import { createSelector } from 'reselect'

import {
  createGetHasAssetsOnOtherChainsSelector,
  createGetParentCombinedAssetSelector,
} from '@exodus/core-selectors/assets/networks/index.js'
import { memoize } from '@exodus/basic-utils'

const isMultiNetworkAsset = (asset) => {
  return asset.assetType === 'MULTI_NETWORK_ASSET'
}

const selectorFactory = (allAssetsSelector) =>
  memoize(
    ({ assetName, hasIcon }) =>
      createSelector(
        allAssetsSelector,
        createGetHasAssetsOnOtherChainsSelector({ allAssetsSelector }),
        createGetParentCombinedAssetSelector({ allAssetsSelector }),
        (allAssets, getHasAssetsOnOtherChainsSelector, getParentCombinedAssetSelector) => {
          const asset = allAssets[assetName]
          const hasAssetsOnOtherChains = getHasAssetsOnOtherChainsSelector(assetName)
          const parentCombined = getParentCombinedAssetSelector(assetName)

          if (!hasIcon) return false
          if (isMultiNetworkAsset(asset)) return false
          const isToken = asset.baseAssetName && asset.baseAssetName !== assetName
          if (isToken) return true
          if (!hasAssetsOnOtherChains) return false

          const primaryAssetName = parentCombined.combinedAssetNames[0]
          return primaryAssetName !== assetName
        }
      ),
    ({ assetName, hasIcon }) => `${assetName}-${hasIcon}`
  )

const getIsAssetWithNetworkIconSelector = {
  id: 'getIsAssetWithNetworkIcon',
  selectorFactory,
  dependencies: [{ selector: 'all' }],
}

export default getIsAssetWithNetworkIconSelector
