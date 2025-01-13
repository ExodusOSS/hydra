import { createSelector } from 'reselect'

import { createGetHasAssetsOnOtherChainsSelector } from '@exodus/core-selectors/assets/networks/index.js'
import { memoize } from '@exodus/basic-utils'

const selectorFactory = (allAssetsSelector) =>
  memoize((assetName) =>
    createSelector(
      allAssetsSelector,
      createGetHasAssetsOnOtherChainsSelector({ allAssetsSelector }),
      (allAssets, hasAssetsOnOtherChainsSelector) => {
        const asset = allAssets[assetName]
        const hasAssetsOnOtherChains = hasAssetsOnOtherChainsSelector(assetName)

        return (
          asset.name === asset.baseAsset.name &&
          (Boolean(asset.api?.getTokens) ||
            asset.api?.hasFeature('customTokens') ||
            hasAssetsOnOtherChains)
        )
      }
    )
  )

const getIsBaseAssetWithChainIconSelector = {
  id: 'getIsBaseAssetWithChainIcon',
  selectorFactory,
  dependencies: [{ selector: 'all' }],
}

export default getIsBaseAssetWithChainIconSelector
