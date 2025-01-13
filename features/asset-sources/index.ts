import assetSourcesDefinition from './module/index.js'
import assetSourcesApiDefinition from './api/index.js'
import { availableAssetNamesByWalletAccountAtomDefinition } from './atoms/index.js'
import assetSourcesLifecyclePluginDefinition from './plugin/lifecycle.js'

export { type AssetSources } from './module/index.js'

const assetSources = () =>
  ({
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
      },
    ],
  }) as const

export default assetSources
