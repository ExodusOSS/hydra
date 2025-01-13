import typeforce from '@exodus/typeforce'

import { isEmpty } from './is-empty.js'
import { errorTrackingApiDefinition } from './api/index.js'
import errorTrackingAtomDefinition from './atoms/index.js'
import errorTrackingReportDefinition from './report/index.js'
import { errorTrackingDefinition, remoteErrorTrackingDefinition } from './module/index.js'

const defaultConfig = { maxErrorsCount: 100 }

const configSchema = {
  maxErrorsCount: (value) => typeof value === 'number' && value > 0 && value <= 9999,
  sentryConfig: '?Object',
}

const errorTracking = (config = Object.create(null)) => {
  config = { ...defaultConfig, ...config }

  const { maxErrorsCount, sentryConfig } = typeforce.parse(configSchema, config)

  return {
    id: 'errorTracking',
    definitions: [
      {
        definition: errorTrackingAtomDefinition,
      },
      {
        definition: errorTrackingApiDefinition,
      },
      {
        definition: errorTrackingDefinition,
        config: { maxErrorsCount },
      },
      {
        if: sentryConfig !== undefined && sentryConfig !== null && !isEmpty(sentryConfig),
        definition: remoteErrorTrackingDefinition,
        config: sentryConfig,
      },
      {
        definition: errorTrackingReportDefinition,
      },
    ],
  }
}

export default errorTracking
