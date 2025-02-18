import {
  featureFlagAtomsDefinition,
  featureFlagsAtomDefinition,
  remoteConfigFeatureFlagAtomsDefinition,
} from './atoms'
import featureFlagsDefinition from './module'

import featureFlagsApiDefinition from './api'
import featureFlagsPluginDefinition from './plugin'

const featureFlags = ({ features = Object.create(null) } = Object.create(null)) => {
  return {
    id: 'featureFlags',
    definitions: [
      {
        definition: featureFlagsDefinition,
        config: { features },
      },
      {
        definition: featureFlagAtomsDefinition,
        storage: { namespace: 'featureFlags' },
        aliases: [
          {
            implementationId: 'unsafeStorage',
            interfaceId: 'storage',
          },
        ],
        config: { features },
      },
      { definition: featureFlagsAtomDefinition },
      { definition: remoteConfigFeatureFlagAtomsDefinition, config: { features } },
      { definition: featureFlagsPluginDefinition },
      { definition: featureFlagsApiDefinition },
    ],
  }
}

export default featureFlags
