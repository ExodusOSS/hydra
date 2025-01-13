import restoreProgressTrackerApi from './api'
import restoreProgressPlugin from './plugin'
import { restoringAssetsAtomDefinition } from './atoms'
import restoreProgressTrackerDefinition from './module'
import restoringAssetsReportDefinition from './report'

const defaultConfig = {
  assetNamesToNotWait: ['monero'],
  monitorEvents: ['after-tick-multiple-wallet-accounts', 'after-restore'],
}

const restoreProgress = (config = {}) => {
  config = { ...defaultConfig, ...config }

  return {
    id: 'restoreProgress',
    definitions: [
      { definition: restoreProgressPlugin },
      {
        definition: restoringAssetsAtomDefinition,
        storage: { namespace: 'restoringAssets' },
      },
      { definition: restoreProgressTrackerApi },
      { definition: restoreProgressTrackerDefinition, config },
      { definition: restoringAssetsReportDefinition },
    ],
  }
}

export default restoreProgress
