import { mapKeys, mapValues } from '@exodus/basic-utils'

const localDefaultsKeyMap = {
  available: 'ready',
}

const supportedOverridesKeyMap = {
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
