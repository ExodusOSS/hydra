import { CT_STATUS } from '@exodus/assets'
import { pick } from '@exodus/basic-utils'

import txLogMonitorsDefinition from './module/index.js'
import restoreAssetsTrackerDefinition from './module/restore-tracker.js'
import txLogMonitorsPluginDefinition from './plugin/index.js'
import restoreAssetsPluginDefinition from './plugin/restore-assets.js'
import txLogMonitorsApiDefinition from './api/index.js'
import { assetsConfigAtomDefinition, restoringAssetsAtomDefinition } from './atoms/index.js'
import restoringAssetsReportDefinition from './report/index.js'

const MODULE_CONFIG_PARAMS = ['txLogTickConcurrency', 'orderedFirst', 'orderedLast']

const defaultRestoreConfig = {
  assetNamesToNotWait: [],
  monitorEvents: ['after-tick-multiple-wallet-accounts', 'after-restore'],
}

const txLogMonitors = (
  { allowedCustomTokensStatusList, assetNamesToNotWait, monitorEvents, ...rest } = Object.create(
    null
  )
) => {
  const pluginConfig = {
    allowedCustomTokensStatusList: allowedCustomTokensStatusList || [
      CT_STATUS.VERIFIED,
      CT_STATUS.CURATED,
    ],
  }
  const moduleConfig = pick(rest, MODULE_CONFIG_PARAMS)

  const restoreConfig = {
    assetNamesToNotWait: assetNamesToNotWait || defaultRestoreConfig.assetNamesToNotWait,
    monitorEvents: monitorEvents || defaultRestoreConfig.monitorEvents,
  }

  return {
    id: 'txLogMonitorsFeature',
    definitions: [
      { definition: txLogMonitorsDefinition, config: moduleConfig },
      { definition: txLogMonitorsPluginDefinition, config: pluginConfig },
      { definition: txLogMonitorsApiDefinition },
      { definition: assetsConfigAtomDefinition },
      {
        definition: restoringAssetsAtomDefinition,
        storage: { namespace: 'restoringAssets' },
      },
      {
        definition: restoreAssetsTrackerDefinition,
        config: { monitorEvents: restoreConfig.monitorEvents },
      },
      {
        definition: restoreAssetsPluginDefinition,
        config: { assetNamesToNotWait: restoreConfig.assetNamesToNotWait },
      },
      { definition: restoringAssetsReportDefinition },
    ],
  }
}

export default txLogMonitors
