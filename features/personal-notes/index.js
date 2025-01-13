import personalNotesApiDefinition from './api'
import { personalNotesAtomDefinition } from './atoms'
import { personalNotesPluginDefinition } from './plugins'
import personalNotesDefinition from './module'

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
