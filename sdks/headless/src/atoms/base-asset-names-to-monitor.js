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

const assertWalletAccountNames = (walletAccounts) => {
  if (
    !Array.isArray(walletAccounts) ||
    !walletAccounts.every((walletAccount) => typeof walletAccount === 'string')
  ) {
    throw new TypeError('alwaysMonitorWalletAccounts must be an array of wallet account names')
  }
}

const createBaseAssetNamesToMonitorAtom = ({
  assetsModule,
  enabledAssetsAtom,
  restoreAtom,
  availableAssetNamesAtom,
  availableAssetNamesByWalletAccountAtom,
  config: { ignoreAssetNames = [], alwaysMonitorWalletAccounts = [] } = Object.create(null),
}) => {
  assertWalletAccountNames(alwaysMonitorWalletAccounts)
  const ignoreAssetNamesSet = new Set(ignoreAssetNames)

  const selector = ({
    isRestore,
    enabledAssets,
    availableAssetNames,
    availableAssetNamesByWalletAccount = Object.create(null),
  }) => {
    const assetNames = [
      ...(isRestore ? availableAssetNames : Object.keys(enabledAssets)),
      ...alwaysMonitorWalletAccounts.flatMap(
        (walletAccount) => availableAssetNamesByWalletAccount[walletAccount] ?? []
      ),
    ]
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
        ...(alwaysMonitorWalletAccounts.length > 0 && {
          availableAssetNamesByWalletAccount: availableAssetNamesByWalletAccountAtom,
        }),
      }),
      selector,
    })
  )
}

// oxlint-disable-next-line @exodus/oxlint-plugin-hydra/export-default-named
export default {
  id: 'baseAssetNamesToMonitorAtom',
  type: 'atom',
  factory: createBaseAssetNamesToMonitorAtom,
  dependencies: [
    'assetsModule',
    'availableAssetNamesAtom',
    'availableAssetNamesByWalletAccountAtom',
    'enabledAssetsAtom',
    'restoreAtom',
    'config?',
  ],
  public: true,
}
