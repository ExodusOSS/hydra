import type apiDefinition from './api/index.js'

declare const postRestoreModal: () => {
  id: 'postRestoreModal'
  definitions: [{ definition: typeof apiDefinition }]
}

export default postRestoreModal
