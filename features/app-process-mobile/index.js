import appProcessDefinition from './module'
import { appProcessAtomDefinition, appStateHistoryAtomDefinition } from './atoms'
import appProcessPluginDefinition from './plugin'
import appProcessApiDefinition from './api'
import appProcessReportDefinition from './report'

const defaultConfig = {
  historyLimit: 25,
  returningFromBackgroundEvent: 'back-from-background',
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
