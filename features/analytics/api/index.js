const createAnalyticsApi = ({ analytics, shareActivityAtom, analyticsUserIdAtom }) => ({
  analytics: {
    track: analytics.track,
    trackInstall: analytics.trackInstall,
    identify: analytics.setUserTraits,
    setDefaultProperties: analytics.setDefaultProperties, // deprecated
    setDefaultEventProperties: analytics.setDefaultEventProperties,
    requireDefaultEventProperties: analytics.requireDefaultEventProperties,
    getUserId: async () => analyticsUserIdAtom.get(),
    setTrackActivities: (value) => shareActivityAtom.set(value),
  },
})

const analyticsApiDefinition = {
  id: 'analyticsApi',
  type: 'api',
  factory: createAnalyticsApi,
  dependencies: ['analytics', 'shareActivityAtom', 'analyticsUserIdAtom'],
}

export default analyticsApiDefinition
