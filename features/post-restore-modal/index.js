import postRestoreModalApiDefinition from './api'
import { shouldShowPostRestoredModalAtomDefinition } from './atoms'
import postRestoreModalPluginDefinition from './plugin'

const postRestoreModal = () => ({
  id: 'postRestoreModal',
  definitions: [
    {
      definition: shouldShowPostRestoredModalAtomDefinition,
      storage: { namespace: 'shouldShowPostRestoredModal' },
      aliases: [
        {
          implementationId: 'unsafeStorage',
          interfaceId: 'storage',
        },
      ],
    },
    { definition: postRestoreModalApiDefinition },
    { definition: postRestoreModalPluginDefinition },
  ],
})

export default postRestoreModal
