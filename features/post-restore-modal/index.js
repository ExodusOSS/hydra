import postRestoreModalApiDefinition from './api/index.js'
import { shouldShowPostRestoredModalAtomDefinition } from './atoms/index.js'
import postRestoreModalPluginDefinition from './plugin/index.js'

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
