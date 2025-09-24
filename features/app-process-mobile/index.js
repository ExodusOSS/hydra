import appProcessDefinition from './module/index.js'
import { appProcessAtomDefinition, appStateHistoryAtomDefinition } from './atoms/index.js'
import appProcessPluginDefinition from './plugin/index.js'
import appProcessApiDefinition from './api.js'
import appProcessReportDefinition from './report/index.js'

const defaultConfig = {
  historyLimit: 25,
  returningFromBackgroundEvent: 'back-from-background',
  lockExtensionDuration: 30_000,
}

const appProcess = (config = Object.create(null)) => {
  config = { ...defaultConfig, ...config }

  return {
    id: 'appProcess',
    definitions: [
      { definition: appProcessDefinition, config },
      { definition: appProcessAtomDefinition },
      { definition: appStateHistoryAtomDefinition },
      { definition: appProcessPluginDefinition },
      { definition: appProcessReportDefinition },
      { definition: appProcessApiDefinition },
    ],
  }
}

export default appProcess
