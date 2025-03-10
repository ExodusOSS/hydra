import typeforce from '@exodus/typeforce'
import { EXODUS_KEY_IDS } from '@exodus/key-ids'

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
  analyticsExtraSeedsUserIdsAtomDefinition,
} from './atoms/index.js'
import analyticsReportDefinition from './report/index.js'

const analytics = (
  {
    segmentConfig: { apiKey, apiBaseUrl = 'https://api.segment.io/v1/' },
    keyIdentifier = EXODUS_KEY_IDS.TELEMETRY,
    installEventReportingUrl,
  } = Object.create(null)
) => {
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
        definition: analyticsExtraSeedsUserIdsAtomDefinition,
        config: { keyIdentifier },
      },
      {
        definition: analyticsTrackerDefinition,
        config: {
          segment: { apiKey, apiBaseUrl },
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
  }
}

export default analytics
