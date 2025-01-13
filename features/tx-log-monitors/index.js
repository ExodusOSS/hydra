import { CT_STATUS } from '@exodus/assets'
import { pick } from '@exodus/basic-utils'

import txLogMonitorsDefinition from './module'
import txLogMonitorsPluginDefinition from './plugin'
import txLogMonitorsApiDefinition from './api'
import { assetsConfigAtomDefinition } from './atoms'

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
