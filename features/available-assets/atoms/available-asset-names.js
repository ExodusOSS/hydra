import { compute } from '@exodus/atoms'

const createAvailableAssetNamesAtom = ({ availableAssetsAtom }) =>
  compute({
    atom: availableAssetsAtom,
    selector: (availableAssets) => availableAssets.map((a) => a.assetName),
  })

export default createAvailableAssetNamesAtom
