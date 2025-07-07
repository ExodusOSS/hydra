import createAuthAtom from './auth.js'

export const authAtomDefinition = {
  id: 'authAtom',
  type: 'atom',
  factory: createAuthAtom,
  public: true,
}
