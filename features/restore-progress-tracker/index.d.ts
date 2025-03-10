import type apiDefinition from './api/index.js'

declare const restoreProgress: () => {
  id: 'restoreProgress'
  definitions: [{ definition: typeof apiDefinition }]
}

export default restoreProgress
