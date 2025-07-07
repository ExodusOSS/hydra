import personalNotesApiDefinition from './api/index.js'
import { personalNotesAtomDefinition } from './atoms/index.js'
import { personalNotesPluginDefinition } from './plugins/index.js'
import personalNotesDefinition from './module/index.js'

const personalNotes = () => {
  return {
    id: 'personalNotes',
    definitions: [
      {
        definition: personalNotesAtomDefinition,
        storage: { namespace: 'personalNotes' },
      },
      {
        definition: personalNotesDefinition,
      },
      { definition: personalNotesPluginDefinition },
      { definition: personalNotesApiDefinition },
    ],
  }
}

export default personalNotes
