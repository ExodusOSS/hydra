import createConnectedOriginsAtom from './connections.js'

export const connectedOriginsAtomDefinition = {
  id: 'connectedOriginsAtom',
  type: 'atom',
  factory: createConnectedOriginsAtom,
  dependencies: ['storage'],
  public: true,
}
