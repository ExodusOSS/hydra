import ms from 'ms'
import typeforce from '@exodus/typeforce'

import remoteConfigModuleDefinition from './module'
import remoteConfigApiDefinition from './api'
import remoteConfigPluginDefinition from './plugin'
import remoteConfigReportDefinition from './report'
import remoteConfigStatusAtomDefinition from './atoms'

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

export * from './types'

export default remoteConfig
