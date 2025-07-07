import createPersonalNotesAtom from './personal-notes.js'

export const personalNotesAtomDefinition = {
  id: 'personalNotesAtom',
  type: 'atom',
  factory: (deps) => createPersonalNotesAtom(deps).atom,
  dependencies: ['storage'],
  public: true,
}
