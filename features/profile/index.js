import profileApiDefinition from './api'
import profileLifecyclePluginDefinition from './plugin'
import { fusionProfileAtomDefinition, localProfileAtomDefinition } from './atoms'
import { DEFAULT_NAME } from './constants'

const profile = ({ defaultName = DEFAULT_NAME } = Object.create(null)) => ({
  id: 'profile',
  definitions: [
    { definition: fusionProfileAtomDefinition },
    {
      definition: localProfileAtomDefinition,
      storage: { namespace: 'profile' },
      aliases: [{ implementationId: 'unsafeStorage', interfaceId: 'storage' }],
      config: {
        defaultName,
      },
    },
    {
      definition: profileApiDefinition,
    },
    {
      definition: profileLifecyclePluginDefinition,
    },
  ],
})

export default profile
