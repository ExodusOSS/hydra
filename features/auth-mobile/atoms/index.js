import createAuthAtom from './auth'

export const authAtomDefinition = {
  id: 'authAtom',
  type: 'atom',
  factory: createAuthAtom,
  public: true,
}
