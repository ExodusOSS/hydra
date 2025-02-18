import { mapKeys, mapValues } from '@exodus/basic-utils'

const localDefaultsKeyMap = {
  __proto__: null,
  available: 'ready',
}

const supportedOverridesKeyMap = {
  __proto__: null,
  enabled: 'enabledOverride',
}

export const convertConfigToFeatureControlFormat = (featureFlagsConfig) =>
  mapValues(featureFlagsConfig, ({ localDefaults, remoteConfig, ...rest }) => {
    return {
      ...rest,
      localDefaults: mapKeys(localDefaults, (value, key) => localDefaultsKeyMap[key] || key),
      remoteConfig: remoteConfig && {
        ...remoteConfig,
        supportedOverrides: mapKeys(
          remoteConfig.supportedOverrides,
          (value, key) => supportedOverridesKeyMap[key] || key
        ),
      },
    }
  })
