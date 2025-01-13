import typeforce from '@exodus/typeforce'

const baseFeatureType = typeforce.compile({
  localDefaults: {
    available: '?Boolean',
    enabled: '?Boolean',
  },
  remoteConfig: typeforce.maybe({
    path: 'String',
    supportedOverrides: {
      geolocation: '?Boolean',
      enabled: '?Boolean',
      shutdownSemver: '?Boolean',
    },
  }),
  featureFlagPlugin: '?String',
  persisted: '?Boolean',
})

const feature = (value) => {
  typeforce(baseFeatureType, value, true)
  if (!value.localDefaults.available && value.localDefaults.enabled) {
    throw new Error(`A feature cannot be enabled if it is not available`)
  }

  return true
}

export const config = typeforce.compile({
  // leave room for other config
  //
  // { [featureName]: { localDefaults, ... } }
  features: typeforce.map(feature),
})
