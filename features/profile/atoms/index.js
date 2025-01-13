import createFusionProfileAtom from './fusion-profile'
import createLocalProfileAtom from './local-profile'

export const fusionProfileAtomDefinition = {
  id: 'fusionProfileAtom',
  type: 'atom',
  factory: createFusionProfileAtom,
  dependencies: ['fusion', 'logger'],
  public: true,
}

export const localProfileAtomDefinition = {
  id: 'profileAtom',
  type: 'atom',
  factory: createLocalProfileAtom,
  dependencies: ['storage', 'config'],
  public: true,
}
