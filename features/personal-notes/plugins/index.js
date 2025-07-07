import createPersonalNotesPlugin from './personal-notes.js'

export const personalNotesPluginDefinition = {
  id: 'personalNotesPlugin',
  type: 'plugin',
  factory: createPersonalNotesPlugin,
  dependencies: ['port', 'personalNotesAtom', 'personalNotes'],
  public: true,
}
