import { compute } from '@exodus/atoms'

const createAvailableAssetsWithoutParentCombinedAtom = ({
  assetsModule,
  availableAssetNamesAtom,
}) => {
  const selector = (availableAssetNames) =>
    availableAssetNames.filter((assetName) => {
      const asset = assetsModule.getAsset(assetName)
      return !asset.isCombined
    })

  return compute({ atom: availableAssetNamesAtom, selector })
}

export default createAvailableAssetsWithoutParentCombinedAtom
