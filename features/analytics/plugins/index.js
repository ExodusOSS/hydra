import createAnalyticsLifecyclePlugin from './lifecycle'

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
    'analyticsExtraSeedsUserIdsAtom',
  ],
  public: true,
}
