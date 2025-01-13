import { EXODUS_KEY_IDS } from '@exodus/key-ids'

import analyticsApi from './api'
import analyticsDefinition from './module'
import analyticsTrackerDefinition from './client'
import { analyticsLifecyclePluginDefinition } from './plugins'
import {
  analyticsUserIdAtomDefinition,
  shareActivityAtomDefinition,
  analyticsAnonymousIdAtomDefinition,
  persistedAnalyticsEventsAtomDefinition,
  persistedAnalyticsTraitsAtomDefinition,
  analyticsExtraSeedsUserIdsAtomDefinition,
} from './atoms'

const analytics = (
  { keyIdentifier = EXODUS_KEY_IDS.TELEMETRY, installEventReportingUrl } = Object.create(null)
) => {
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
      { definition: analyticsTrackerDefinition },
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
    ],
  }
}

export default analytics
