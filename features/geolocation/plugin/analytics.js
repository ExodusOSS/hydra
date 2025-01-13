const createGeolocationAnalyticsPlugin = ({ analytics, geolocationAtom }) => {
  let unsubscribe

  const onStart = () => {
    analytics.requireDefaultEventProperties(['country'])

    unsubscribe = geolocationAtom.observe(({ countryCode, regionCode }) => {
      analytics.setDefaultEventProperties({ country: countryCode, region: regionCode })
    })
  }

  const onStop = () => unsubscribe?.()

  return { onStart, onStop }
}

const geolocationAnalyticsPluginDefinition = {
  id: 'geolocationAnalyticsPlugin',
  type: 'plugin',
  factory: createGeolocationAnalyticsPlugin,
  dependencies: ['analytics', 'geolocationAtom'],
  public: true,
}

export default geolocationAnalyticsPluginDefinition
