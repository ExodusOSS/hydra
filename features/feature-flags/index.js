import {
  featureFlagAtomsDefinition,
  featureFlagsAtomDefinition,
  remoteConfigFeatureFlagAtomsDefinition,
} from './atoms/index.js'
import featureFlagsDefinition from './module/index.js'

import featureFlagsApiDefinition from './api/index.js'
import featureFlagsPluginDefinition from './plugin/index.js'

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
