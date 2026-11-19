import typeforce from '@exodus/typeforce'
import { EXODUS_KEY_IDS } from '@exodus/key-ids'
import type KeyIdentifier from '@exodus/key-identifier'

import analyticsApi from './api/index.js'
import analyticsDefinition from './module/index.js'
import analyticsTrackerDefinition from './client/index.js'
import { analyticsLifecyclePluginDefinition } from './plugins/index.js'
import {
  analyticsUserIdAtomDefinition,
  shareActivityAtomDefinition,
  analyticsAnonymousIdAtomDefinition,
  persistedAnalyticsEventsAtomDefinition,
  persistedAnalyticsTraitsAtomDefinition,
} from './atoms/index.js'
import analyticsReportDefinition from './report/index.js'

export type { AnalyticsApi } from './api/index.js'
export type { Analytics, AnalyticsTrackPayload, AnalyticsIdentifyPayload } from './module/index.js'

const DEFAULT_PRESERVE_EVENT_NAMES = ['$experiment_started']
const DEFAULT_PRESERVE_PROPERTY_KEYS: Record<string, string[]> = {
  $experiment_started: ['Experiment name', 'Variant name', '$experiment_type'],
}

export type AnalyticsApiConfig = {
  segmentConfig: {
    apiKey: string
    apiBaseUrl?: string
    preserveEventNames?: string[]
    preservePropertyKeys?: Record<string, string[]>
  }
  keyIdentifier?: KeyIdentifier
  installEventReportingUrl?: string
}

const analytics = ({
  segmentConfig: {
    apiKey,
    apiBaseUrl = 'https://api.segment.io/v1/',
    preserveEventNames = [],
    preservePropertyKeys = {},
  },
  keyIdentifier = EXODUS_KEY_IDS.TELEMETRY,
  installEventReportingUrl,
}: AnalyticsApiConfig) => {
  const mergedPreserveEventNames = [...DEFAULT_PRESERVE_EVENT_NAMES, ...preserveEventNames]
  const mergedPreservePropertyKeys = { ...DEFAULT_PRESERVE_PROPERTY_KEYS, ...preservePropertyKeys }
  typeforce(
    {
      apiKey: 'String',
      apiBaseUrl: 'String',
    },
    { apiKey, apiBaseUrl },
    true
  )

  return {
    id: 'analytics',
    definitions: [
      {
        definition: analyticsApi,
      },
      { definition: shareActivityAtomDefinition },
      {
        definition: analyticsUserIdAtomDefinition,
        aliases: [{ implementationId: 'unsafeStorage', interfaceId: 'storage' }],
        storage: { namespace: 'analytics' },
        config: { keyIdentifier },
      },
      {
        definition: analyticsTrackerDefinition,
        config: {
          segment: {
            apiKey,
            apiBaseUrl,
            preserveEventNames: mergedPreserveEventNames,
            preservePropertyKeys: mergedPreservePropertyKeys,
          },
        },
      },
      { definition: analyticsLifecyclePluginDefinition },
      {
        definition: analyticsAnonymousIdAtomDefinition,
        aliases: [{ implementationId: 'unsafeStorage', interfaceId: 'storage' }],
        storage: { namespace: 'analytics' },
      },
      {
        definition: persistedAnalyticsEventsAtomDefinition,
        aliases: [{ implementationId: 'unsafeStorage', interfaceId: 'storage' }],
        storage: { namespace: 'analytics' },
      },
      {
        definition: persistedAnalyticsTraitsAtomDefinition,
        aliases: [{ implementationId: 'unsafeStorage', interfaceId: 'storage' }],
        storage: { namespace: 'analytics' },
      },
      {
        definition: analyticsDefinition,
        aliases: [{ implementationId: 'unsafeStorage', interfaceId: 'storage' }],
        storage: { namespace: 'analytics' },
        config: { installEventReportingUrl },
      },
      {
        definition: analyticsReportDefinition,
      },
    ],
  } as const
}

export default analytics
