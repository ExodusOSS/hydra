import typeforce from '@exodus/typeforce'

import { errorTrackingApiDefinition } from './api/index.js'
import { errorsAtomDefinition, remoteErrorTrackingEnabledAtomDefinition } from './atoms/index.js'
import errorTrackingReportDefinition from './report/index.js'
import { errorTrackingDefinition, remoteErrorTrackingDefinition } from './module/index.js'
import errorTrackingPluginDefinition from './plugin/index.js'

const defaultConfig = {
  maxErrorsCount: 100,
  sentryConfig: undefined,
  remoteErrorTrackingABExperimentId: 'sentry',
  remoteErrorTrackingFundedWalletsABExperimentId: 'sentry-funded',
  trackWalletsCreatedAfter: new Date('2025-07-21'),
  trackFundedWallets: false,
}

const configSchema = {
  maxErrorsCount: (value) => typeof value === 'number' && value > 0 && value <= 9999,
  sentryConfig: '?Object',
  remoteErrorTrackingABExperimentId: '?String',
  remoteErrorTrackingFundedWalletsABExperimentId: '?String',
  trackWalletsCreatedAfter: '?Date',
  trackFundedWallets: '?Boolean',
}

const errorTracking = (config = Object.create(null)) => {
  config = { ...defaultConfig, ...config }

  const {
    maxErrorsCount,
    sentryConfig,
    remoteErrorTrackingABExperimentId,
    remoteErrorTrackingFundedWalletsABExperimentId,
    trackWalletsCreatedAfter,
    trackFundedWallets,
  } = typeforce.parse(configSchema, config, true)

  const remoteErrorTrackingAvailable = !!sentryConfig && !!remoteErrorTrackingABExperimentId
  return {
    id: 'errorTracking',
    definitions: [
      {
        definition: errorsAtomDefinition,
      },
      {
        definition: remoteErrorTrackingEnabledAtomDefinition,
      },
      {
        definition: errorTrackingApiDefinition,
      },
      {
        definition: errorTrackingDefinition,
        config: { maxErrorsCount },
      },
      {
        if: remoteErrorTrackingAvailable,
        definition: remoteErrorTrackingDefinition,
        config: sentryConfig,
      },
      // deprecated, errors will go to sentry
      {
        definition: errorTrackingReportDefinition,
      },
      {
        definition: errorTrackingPluginDefinition,
        config: {
          remoteErrorTrackingABExperimentId,
          remoteErrorTrackingFundedWalletsABExperimentId,
          trackWalletsCreatedAfter,
          trackFundedWallets,
        },
      },
    ],
  }
}

export default errorTracking
