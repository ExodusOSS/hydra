import { difference } from '@exodus/atoms'

const createEnabledAssetsDifferenceAtom = ({ enabledAssetsAtom }) => difference(enabledAssetsAtom)

export default createEnabledAssetsDifferenceAtom
