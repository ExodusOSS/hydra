import { createSelector } from 'reselect'
import memoize from '../../utils/memoize.js'

export const createParentCombinedNetworkAssetsSelector = createSelector(
  (deps) => deps.allAssetsSelector,
  (allAssetsSelector) =>
    createSelector(allAssetsSelector, (assets) =>
      Object.values(assets).filter((asset) => asset.assetType === 'MULTI_NETWORK_ASSET')
    )
)

export const createParentCombinedNetworkAssetsMapSelector = createSelector(
  (deps) => deps.allAssetsSelector,
  (allAssetsSelector) =>
    createSelector(
      createParentCombinedNetworkAssetsSelector({ allAssetsSelector }),
      (parentCombinedNetworkAssetsList) =>
        Object.fromEntries(parentCombinedNetworkAssetsList.map((asset) => [asset.name, asset]))
    )
)

export const createGetParentCombinedAssetSelector = createSelector(
  (deps) => deps.allAssetsSelector,
  (allAssetsSelector) =>
    createSelector(
      createParentCombinedNetworkAssetsMapSelector({ allAssetsSelector }),
      (parentCombinedNetworkAssets) =>
        memoize((assetName) => {
          if (parentCombinedNetworkAssets[assetName]) return parentCombinedNetworkAssets[assetName] // already multi-chain asset
          const multiChainAssetsList = Object.values(parentCombinedNetworkAssets)
          return multiChainAssetsList.find((multiChainAsset) =>
            multiChainAsset.combinedAssetNames?.includes(assetName)
          )
        })
    )
)

export const createCombinedNetworkChildrenAssetsSelector = createSelector(
  (deps) => deps.allAssetsSelector,
  (allAssetsSelector) =>
    createSelector(
      createParentCombinedNetworkAssetsSelector({ allAssetsSelector }),
      (parentCombinedNetworkAssets) => {
        const uniqueAssetsMap = new Map()
        parentCombinedNetworkAssets.forEach((combinedAsset) => {
          combinedAsset.combinedAssets.forEach((childAsset) => {
            if (!uniqueAssetsMap.has(childAsset.name)) {
              uniqueAssetsMap.set(childAsset.name, childAsset)
            }
          })
        })

        return [...uniqueAssetsMap.values()]
      }
    )
)

export const createWithoutParentCombinedNetworkAssetsSelector = createSelector(
  (deps) => deps.allAssetsSelector,
  (allAssetsSelector) =>
    createSelector(allAssetsSelector, (assets) =>
      Object.values(assets).filter((asset) => !asset.isCombined)
    )
)

export const createWithoutCombinedNetworkAssetsSelector = createSelector(
  (deps) => deps.allAssetsSelector,
  (allAssetsSelector) =>
    createSelector(
      createWithoutParentCombinedNetworkAssetsSelector({ allAssetsSelector }),
      createCombinedNetworkChildrenAssetsSelector({ allAssetsSelector }),
      (assetsWithoutCombinedParents, combinedAssetsChildren) => {
        const combinedAssetsChildrenNames = new Set(
          combinedAssetsChildren.map((asset) => asset.name)
        )

        return assetsWithoutCombinedParents.filter(
          (asset) => !combinedAssetsChildrenNames.has(asset.name)
        )
      }
    )
)

export const createWithParentCombinedNetworkAssetsSelector = createSelector(
  (deps) => deps.allAssetsSelector,
  (allAssetsSelector) =>
    createSelector(
      createWithoutCombinedNetworkAssetsSelector({ allAssetsSelector }),
      createParentCombinedNetworkAssetsSelector({ allAssetsSelector }),
      (assetsWithoutCombined, combinedNetworkAssets) => [
        ...assetsWithoutCombined,
        ...combinedNetworkAssets,
      ]
    )
)

export const createEnabledWithParentCombinedNetworkAssetNamesSelector = createSelector(
  (deps) => deps.allAssetsSelector,
  (deps) => deps.enabledAssetsSelector,
  (allAssetsSelector, enabledAssetsSelector) =>
    createSelector(
      enabledAssetsSelector,
      createWithoutCombinedNetworkAssetsSelector({ allAssetsSelector }),
      createParentCombinedNetworkAssetsSelector({ allAssetsSelector }),
      (enabledAssetsMap, assets, combined) => [
        ...combined
          .filter((asset) =>
            asset.combinedAssetNames.some((assetName) => !!enabledAssetsMap[assetName])
          )
          .map((asset) => {
            const enabledAssetNames = asset.combinedAssetNames.filter(
              (assetName) => !!enabledAssetsMap[assetName]
            )

            return enabledAssetNames.length > 1 ? asset.name : enabledAssetNames[0]
          }),
        ...assets.filter((asset) => !!enabledAssetsMap[asset.name]).map(({ name }) => name),
      ]
    )
)

export const createNetworksByAssetSelector = createSelector(
  (deps) => deps.allAssetsSelector,
  (allAssetsSelector) =>
    createSelector(
      createParentCombinedNetworkAssetsSelector({ allAssetsSelector }),
      (combinedAssets) =>
        Object.fromEntries(
          combinedAssets.flatMap((combinedAsset) => {
            const assets = combinedAsset.combinedAssets
            const primaryAsset = assets[0]
            const assetNetworks = assets.map((asset) => ({
              name: asset.baseAsset.name,
              assetName: asset.name,
              primary: asset.name === primaryAsset.name,
              ...(asset && asset.available !== undefined && { available: asset.available }),
            }))
            return assets.map((asset) => [asset.name, assetNetworks])
          })
        )
    )
)

export const createGetHasAssetsOnOtherChainsSelector = createSelector(
  (deps) => deps.allAssetsSelector,
  (allAssetsSelector) => {
    const getParentCombinedAssetSelector = createGetParentCombinedAssetSelector({
      allAssetsSelector,
    })
    return createSelector(getParentCombinedAssetSelector, (getParentCombinedAsset) => {
      return memoize((assetName) => {
        const parentCombinedAsset = getParentCombinedAsset(assetName)
        if (!parentCombinedAsset) return false
        return parentCombinedAsset.combinedAssetNames.length > 1
      })
    })
  }
)

export const createGetCombinedAssetFallbackSelector = createSelector(
  (deps) => deps.allAssetsSelector,
  (allAssetsSelector) => {
    const getParentCombinedAssetSelector = createGetParentCombinedAssetSelector({
      allAssetsSelector,
    })
    return createSelector(
      allAssetsSelector,
      getParentCombinedAssetSelector,
      (allAssets, getParentCombinedAsset) => {
        return memoize((assetName) => {
          if (allAssets[assetName]?.isCombined) {
            return allAssets[assetName].combinedAssets[0]
          }

          const combinedAsset = getParentCombinedAsset(assetName)
          if (combinedAsset) return combinedAsset.combinedAssets[0]
          return allAssets[assetName]
        })
      }
    )
  }
)

export const createCreateCombinedAssetChildrenNamesSelector = createSelector(
  (deps) => deps.allAssetsSelector,
  (allAssetsSelector) => {
    return memoize((assetName) =>
      createSelector(allAssetsSelector, (allAssets) => {
        const asset = allAssets[assetName]
        return asset && asset.isCombined ? asset.combinedAssetNames : [assetName]
      })
    )
  }
)

export default createParentCombinedNetworkAssetsSelector
