import { createDefaultEnabledAssetNamesAtom } from './default-enabled-asset-names.js'
import createEnabledAndDisabledAssetsAtom from './enabled-and-disabled-assets.js'
import createEnabledAssetsAtom from './enabled-assets.js'
import createEnabledAssetsDifferenceAtom from './enabled-assets-difference.js'

export const enabledAndDisabledAssetsAtomDefinition = {
  id: 'enabledAndDisabledAssetsAtom',
  type: 'atom',
  factory: createEnabledAndDisabledAssetsAtom,
  dependencies: ['storage'],
  public: true,
}

export const enabledAssetsAtomDefinition = {
  id: 'enabledAssetsAtom',
  type: 'atom',
  factory: createEnabledAssetsAtom,
  dependencies: ['enabledAndDisabledAssetsAtom', 'availableAssetNamesAtom'],
  public: true,
}

export const enabledAssetsDifferenceAtomDefinition = {
  id: 'enabledAssetsDifferenceAtom',
  type: 'atom',
  factory: createEnabledAssetsDifferenceAtom,
  dependencies: ['enabledAssetsAtom'],
  public: true,
}

export const defaultEnabledAssetNamesAtomDefinition = {
  id: 'defaultEnabledAssetNamesAtom',
  type: 'atom',
  factory: createDefaultEnabledAssetNamesAtom,
}
