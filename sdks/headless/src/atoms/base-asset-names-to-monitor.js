import { combine, compute, dedupe } from '@exodus/atoms'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

const { uniq } = lodash

const getNetworks = (assetNames, assets) =>
  uniq(
    assetNames
      .map((assetName) => assets[assetName]?.baseAsset.name)
      .filter((assetName) => !!assetName && !assets[assetName].isCombined)
  )

const createBaseAssetNamesToMonitorAtom = ({
  assetsModule,
  enabledAssetsAtom,
  restoreAtom,
  availableAssetNamesAtom,
  config: { ignoreAssetNames = [] } = Object.create(null),
}) => {
  const ignoreAssetNamesSet = new Set(ignoreAssetNames)

  const selector = ({ isRestore, enabledAssets, availableAssetNames }) => {
    const assetNames = isRestore ? availableAssetNames : Object.keys(enabledAssets)
    return getNetworks(assetNames, assetsModule.getAssets()).filter(
      (assetName) => !ignoreAssetNamesSet.has(assetName)
    )
  }

  return dedupe(
    compute({
      atom: combine({
        isRestore: restoreAtom,
        enabledAssets: enabledAssetsAtom,
        availableAssetNames: availableAssetNamesAtom,
      }),
      selector,
    })
  )
}

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'baseAssetNamesToMonitorAtom',
  type: 'atom',
  factory: createBaseAssetNamesToMonitorAtom,
  dependencies: [
    'assetsModule',
    'availableAssetNamesAtom',
    'enabledAssetsAtom',
    'restoreAtom',
    'config?',
  ],
  public: true,
}
