import createPersonalNotesAtom from './personal-notes'

export const personalNotesAtomDefinition = {
  id: 'personalNotesAtom',
  type: 'atom',
  factory: (deps) => createPersonalNotesAtom(deps).atom,
  dependencies: ['storage'],
  public: true,
}
