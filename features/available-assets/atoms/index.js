import createAvailableAssetNamesWithoutParentCombinedAtom from './available-asset-names-without-parent-combined.js'
import createAvailableAssetNamesAtom from './available-asset-names.js'
import createAvailableAssetAtom from './available-assets.js'

export const availableAssetNamesAtomDefinition = {
  id: 'availableAssetNamesAtom',
  type: 'atom',
  factory: createAvailableAssetNamesAtom,
  dependencies: ['availableAssetsAtom'],
  public: true,
}

export const availableAssetsAtomDefinition = {
  id: 'availableAssetsAtom',
  type: 'atom',
  factory: createAvailableAssetAtom,
  public: true,
}

export const availableAssetNamesWithoutParentCombinedAtomDefinition = {
  id: 'availableAssetNamesWithoutParentCombinedAtom',
  type: 'atom',
  factory: createAvailableAssetNamesWithoutParentCombinedAtom,
  dependencies: ['assetsModule', 'availableAssetNamesAtom'],
  public: true,
}
