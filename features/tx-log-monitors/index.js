import { CT_STATUS } from '@exodus/assets'
import { pick } from '@exodus/basic-utils'

import txLogMonitorsDefinition from './module/index.js'
import txLogMonitorsPluginDefinition from './plugin/index.js'
import txLogMonitorsApiDefinition from './api/index.js'
import { assetsConfigAtomDefinition } from './atoms/index.js'

const MODULE_CONFIG_PARAMS = ['txLogTickConcurrency', 'orderedFirst', 'orderedLast']

const txLogMonitors = ({ allowedCustomTokensStatusList, ...rest } = Object.create(null)) => {
  const pluginConfig = {
    allowedCustomTokensStatusList: allowedCustomTokensStatusList || [
      CT_STATUS.VERIFIED,
      CT_STATUS.CURATED,
    ],
  }
  const moduleConfig = pick(rest, MODULE_CONFIG_PARAMS)

  return {
    id: 'txLogMonitorsFeature',
    definitions: [
      { definition: txLogMonitorsDefinition, config: moduleConfig },
      { definition: txLogMonitorsPluginDefinition, config: pluginConfig },
      { definition: txLogMonitorsApiDefinition },
      { definition: assetsConfigAtomDefinition },
    ],
  }
}

export default txLogMonitors
