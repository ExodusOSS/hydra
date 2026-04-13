import assetSourcesDefinition from './module/index.js'
import assetSourcesApiDefinition from './api/index.js'
import { availableAssetNamesByWalletAccountAtomDefinition } from './atoms/index.js'
import assetSourcesLifecyclePluginDefinition from './plugin/lifecycle.js'
import defaultConfig from './default-config.js'

export { type AssetSources } from './module/index.js'

type AssetSourcesConfig = {
  delegatedAllowedAssetNames?: string[]
}

const assetSources = (walletConfig: AssetSourcesConfig = Object.create(null)) => {
  const config = {
    ...defaultConfig,
    delegatedAllowedAssetNames:
      walletConfig.delegatedAllowedAssetNames || defaultConfig.delegatedAllowedAssetNames,
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
