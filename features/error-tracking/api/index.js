export const errorTrackingApiDefinition = {
  id: 'errorTrackingApi',
  type: 'api',
  factory: ({ errorTracking }) => ({
    errors: {
      track: errorTracking.track,
    },
  }),
  dependencies: ['errorTracking'],
}
