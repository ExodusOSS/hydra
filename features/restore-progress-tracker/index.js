import restoreProgressTrackerApi from './api/index.js'
import restoreProgressPlugin from './plugin/index.js'
import { restoringAssetsAtomDefinition } from './atoms/index.js'
import restoreProgressTrackerDefinition from './module/index.js'
import restoringAssetsReportDefinition from './report/index.js'

const defaultConfig = {
  assetNamesToNotWait: ['monero'],
  monitorEvents: ['after-tick-multiple-wallet-accounts', 'after-restore'],
}

const restoreProgress = (config = Object.create(null)) => {
  config = { ...defaultConfig, ...config }

  return {
    id: 'restoreProgress',
    definitions: [
      {
        definition: restoreProgressPlugin,
        config: { assetNamesToNotWait: config.assetNamesToNotWait },
      },
      {
        definition: restoringAssetsAtomDefinition,
        storage: { namespace: 'restoringAssets' },
      },
      { definition: restoreProgressTrackerApi },
      {
        definition: restoreProgressTrackerDefinition,
        config: { monitorEvents: config.monitorEvents },
      },
      { definition: restoringAssetsReportDefinition },
    ],
  }
}

export default restoreProgress
