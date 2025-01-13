import createPersonalNotesPlugin from './personal-notes'

export const personalNotesPluginDefinition = {
  id: 'personalNotesPlugin',
  type: 'plugin',
  factory: createPersonalNotesPlugin,
  dependencies: ['port', 'personalNotesAtom', 'personalNotes'],
  public: true,
}
