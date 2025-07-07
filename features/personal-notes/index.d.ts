import type apiDefinition from './api/index.js'

declare const personalNotes: () => {
  id: 'personalNotes'
  definitions: [{ definition: typeof apiDefinition }]
}

export default personalNotes
