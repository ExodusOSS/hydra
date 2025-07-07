import createRestoringAssetsAtom from './storage.js'

export const restoringAssetsAtomDefinition = {
  id: 'restoringAssetsAtom',
  type: 'atom',
  factory: createRestoringAssetsAtom,
  dependencies: ['storage'],
  public: true,
}
