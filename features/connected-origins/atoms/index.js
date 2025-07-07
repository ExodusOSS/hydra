import createConnectedOriginsAtom from './connected-origins.js'
import createConnectedAccountsAtom from './connected-accounts.js'

export const connectedOriginsAtomDefinition = {
  id: 'connectedOriginsAtom',
  type: 'atom',
  factory: createConnectedOriginsAtom,
  dependencies: ['storage'],
  public: true,
}

export const connectedAccountsAtomDefinition = {
  id: 'connectedAccountsAtom',
  type: 'atom',
  factory: createConnectedAccountsAtom,
  dependencies: ['storage'],
}
