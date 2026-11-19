import assetSourcesDefinition from './module/index.js'
import assetSourcesApiDefinition from './api/index.js'
import { availableAssetNamesByWalletAccountAtomDefinition } from './atoms/index.js'
import assetSourcesLifecyclePluginDefinition from './plugin/lifecycle.js'
import defaultConfig from './default-config.js'
import type { AllowedBaseAssetNamesByWalletAccount } from './atoms/available-asset-names-by-wallet-account.js'

export { type AssetSources } from './module/index.js'
export type { WalletAccounts } from './types.js'

type AssetSourcesConfig = {
  delegatedAllowedAssetNames?: string[]
  allowedBaseAssetNamesByWalletAccount?: AllowedBaseAssetNamesByWalletAccount
}

const assetSources = (walletConfig: AssetSourcesConfig = Object.create(null)) => {
  const config = {
    ...defaultConfig,
    delegatedAllowedAssetNames:
      walletConfig.delegatedAllowedAssetNames || defaultConfig.delegatedAllowedAssetNames,
    allowedBaseAssetNamesByWalletAccount:
      walletConfig.allowedBaseAssetNamesByWalletAccount === undefined
        ? defaultConfig.allowedBaseAssetNamesByWalletAccount
        : walletConfig.allowedBaseAssetNamesByWalletAccount,
  }

  return {
    id: 'assetSources',

    definitions: [
      {
        definition: assetSourcesDefinition,
      },
      {
        definition: assetSourcesLifecyclePluginDefinition,
      },
      {
        definition: assetSourcesApiDefinition,
      },
      {
        definition: availableAssetNamesByWalletAccountAtomDefinition,
        config,
      },
    ],
  } as const
}

export default assetSources
