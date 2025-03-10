import applicationApiDefinition from './api/index.js'
import applicationModuleDefinition from './modules/index.js'
import passphraseCacheDefinition from './modules/passphrase-cache.js'
import applicationReportDefinition from './report/index.js'
import { lifecyclePluginDefinition } from './plugins/index.js'

import {
  autoLockTimerAtomDefinition,
  backedUpAtomDefinition,
  lockedAtomDefinition,
  lockHistoryAtomDefinition,
  restoreAtomDefinition,
  walletCreatedAtAtomDefinition,
} from './atoms/index.js'

export * from './constants/index.js'

export type { ApplicationApi } from './api/index.js'
export type { Application } from './modules/application.js'

type ApplicationConfig = {
  cachePassphrase?: boolean
  passphraseCacheMaxTtl?: number
}

const application = (
  { cachePassphrase, passphraseCacheMaxTtl }: ApplicationConfig = Object.create(null)
) => {
  return {
    id: 'application',
    definitions: [
      { definition: applicationApiDefinition },
      { definition: applicationModuleDefinition },
      { definition: lockedAtomDefinition },
      { definition: restoreAtomDefinition },
      { definition: lockHistoryAtomDefinition },
      { definition: walletCreatedAtAtomDefinition },
      { definition: lifecyclePluginDefinition },
      {
        definition: backedUpAtomDefinition,
        storage: { namespace: 'application' },
        aliases: [{ interfaceId: 'storage', implementationId: 'unsafeStorage' }],
      },
      {
        definition: autoLockTimerAtomDefinition,
        storage: { namespace: 'autoLock' },
        aliases: [{ interfaceId: 'storage', implementationId: 'unsafeStorage' }],
      },
      {
        if: !!cachePassphrase,
        definition: passphraseCacheDefinition,
        storage: { namespace: 'passphrase' },
        aliases: [{ interfaceId: 'storage', implementationId: 'sessionStorage' }],
        config: { maxTtl: passphraseCacheMaxTtl },
      },
      { definition: applicationReportDefinition },
    ],
  }
}

export default application
