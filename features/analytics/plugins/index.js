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
    'analyticsExtraSeedsUserIdsAtom?',
    'config',
  ],
  public: true,
}
