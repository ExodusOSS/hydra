import { mapValues, pickBy } from '@exodus/basic-utils'
import { compute } from '@exodus/atoms'
import { createRemoteConfigAtomFactory } from '@exodus/remote-config-atoms'
import normalizeRemoteConfigValue from './utils/normalize-remote-config-value.js'

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'remoteConfigFeatureFlagAtoms',
  type: 'atom-collection',
  dependencies: ['config', 'remoteConfig'],
  factory: ({ config, remoteConfig }) => {
    const createRemoteConfigAtom = createRemoteConfigAtomFactory({ remoteConfig })
    const remoteConfigurableFeatures = pickBy(
      config.features,
      ({ remoteConfig, featureFlagPlugin }) => remoteConfig?.path && !featureFlagPlugin
    )

    return mapValues(remoteConfigurableFeatures, ({ remoteConfig }, name) =>
      compute({
        atom: createRemoteConfigAtom({ path: remoteConfig.path }),
        selector: normalizeRemoteConfigValue,
      })
    )
  },
  public: true,
}
