import ms from 'ms'
import typeforce from '@exodus/typeforce'

import remoteConfigModuleDefinition from './module/index.js'
import remoteConfigApiDefinition from './api/index.js'
import remoteConfigPluginDefinition from './plugin/index.js'
import remoteConfigReportDefinition from './report/index.js'
import remoteConfigAtomDefinition from './atoms/remote-config.js'

const configSchema = {
  remoteConfigUrl: '?String',
  fetchInterval: 'Number',
  errorBackoffTime: 'Number',
}

const defaultConfig = {
  fetchInterval: ms('2m'),
  errorBackoffTime: ms('5s'),
}

const remoteConfig = (config = Object.create(null)) => {
  config = { ...defaultConfig, ...config }

  typeforce(configSchema, config, true)

  return {
    id: 'remoteConfig',
    definitions: [
      { definition: remoteConfigModuleDefinition, config },
      { definition: remoteConfigPluginDefinition },
      { definition: remoteConfigApiDefinition },
      { definition: remoteConfigReportDefinition },
      {
        definition: remoteConfigAtomDefinition,
        storage: { namespace: 'remoteConfig' },
        aliases: [{ implementationId: 'unsafeStorage', interfaceId: 'storage' }],
      },
    ],
  } as const
}

export type {
  Fetch,
  GetBuildMetadata,
  RemoteConfigData,
  RemoteConfigType,
  Port,
  Freeze,
} from './types/index.js'

export default remoteConfig
