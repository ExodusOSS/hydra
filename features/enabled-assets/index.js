import enabledAssetsApiDefinition from './api/index.js'
import enabledAssetsPluginDefinition from './plugin/index.js'
import enabledAssetsModuleDefinition from './module/index.js'
import {
  defaultEnabledAssetNamesAtomDefinition,
  enabledAndDisabledAssetsAtomDefinition,
  enabledAssetsAtomDefinition,
  enabledAssetsDifferenceAtomDefinition,
} from './atoms/index.js'
import autoEnableAssetsPluginDefinition from './plugin/auto-enable-assets.js'
import enabledAssetsAnalyticsPluginDefinition from './plugin/analytics.js'
import enabledAssetsReportDefinition from './report/index.js'

const enabledAssets = (config = Object.create(null)) => {
  return {
    id: 'enabledAssets',
    definitions: [
      {
        definition: enabledAssetsModuleDefinition,
        config: {
          defaultEnabledAssetsList: config.defaultEnabledAssetsList,
          defaultEnabledAssetsListForFreshWallets: config.defaultEnabledAssetsListForFreshWallets,
        },
      },
      {
        definition: enabledAndDisabledAssetsAtomDefinition,
        storage: { namespace: 'enabledAssets' },
      },
      { definition: defaultEnabledAssetNamesAtomDefinition },
      { definition: enabledAssetsAtomDefinition },
      { definition: enabledAssetsPluginDefinition },
      {
        definition: autoEnableAssetsPluginDefinition,
        config: {
          alwaysAutoEnable: config.alwaysAutoEnable,
          throttleInterval: config.throttleInterval ?? 500,
        },
      },
      {
        if: { registered: ['analytics'] },
        definition: enabledAssetsAnalyticsPluginDefinition,
      },
      { definition: enabledAssetsApiDefinition },
      { definition: enabledAssetsDifferenceAtomDefinition },
      { definition: enabledAssetsReportDefinition },
    ],
  }
}

export default enabledAssets
