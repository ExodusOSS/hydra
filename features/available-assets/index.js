import {
  availableAssetNamesAtomDefinition,
  availableAssetNamesWithoutParentCombinedAtomDefinition,
  availableAssetsAtomDefinition,
} from './atoms/index.js'
import availableAssetsModuleDefinition from './module/index.js'
import availableAssetsApiDefinition from './api/index.js'
import availableAssetsPluginDefinition from './plugins/index.js'
import remoteConfigAvailableTokensPluginDefinition from './plugins/remote-config-available-custom-tokens.js'

const availableAssets = (config = Object.create(null)) => ({
  id: 'availableAssets',
  definitions: [
    {
      definition: availableAssetsModuleDefinition,
      config: {
        defaultAvailableAssetNames: config.defaultAvailableAssetNames,
      },
    },
    {
      definition: availableAssetsAtomDefinition,
    },
    { definition: availableAssetNamesAtomDefinition },
    { definition: availableAssetNamesWithoutParentCombinedAtomDefinition },
    { definition: availableAssetsApiDefinition },
    { definition: availableAssetsPluginDefinition },
    { definition: remoteConfigAvailableTokensPluginDefinition },
  ],
})

export default availableAssets
