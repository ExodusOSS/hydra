import type { Definition } from '@exodus/dependency-types'

import createAnalyticsLifecyclePlugin from './lifecycle.js'

export const analyticsLifecyclePluginDefinition = {
  id: 'analyticsLifecyclePlugin',
  type: 'plugin',
  factory: createAnalyticsLifecyclePlugin,
  dependencies: [
    'port',
    'analytics',
    'shareActivityAtom',
    'analyticsUserIdAtom',
    'analyticsAnonymousIdAtom',
  ],
  public: true,
} as const satisfies Definition
