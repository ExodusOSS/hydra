import { combine, compute } from '@exodus/atoms'

const createAvailableAssetsWithoutParentCombinedAtom = ({
  assetsAtom,
  availableAssetNamesAtom,
}) => {
  const selector = ({ availableAssetNames, assetsAtomValue }) => {
    const assets = assetsAtomValue.value
    return availableAssetNames.filter((assetName) => {
      const asset = assets[assetName]
      return !asset.isCombined
    })
  }

  return compute({
    atom: combine({ availableAssetNames: availableAssetNamesAtom, assetsAtomValue: assetsAtom }),
    selector,
  })
}

export default createAvailableAssetsWithoutParentCombinedAtom
