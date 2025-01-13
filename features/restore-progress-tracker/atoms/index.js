import createRestoringAssetsAtom from './storage'

export const restoringAssetsAtomDefinition = {
  id: 'restoringAssetsAtom',
  type: 'atom',
  factory: createRestoringAssetsAtom,
  dependencies: ['storage'],
  public: true,
}
