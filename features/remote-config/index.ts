import ms from 'ms'
import typeforce from '@exodus/typeforce'

import remoteConfigModuleDefinition from './module/index.js'
import remoteConfigApiDefinition from './api/index.js'
import remoteConfigPluginDefinition from './plugin/index.js'
import remoteConfigReportDefinition from './report/index.js'
import remoteConfigStatusAtomDefinition from './atoms/index.js'

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
      { definition: remoteConfigStatusAtomDefinition },
      { definition: remoteConfigPluginDefinition },
      { definition: remoteConfigApiDefinition },
      { definition: remoteConfigReportDefinition },
    ],
  } as const
}

export * from './types/index.js'

export default remoteConfig
