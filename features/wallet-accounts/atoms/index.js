import createEnabledWalletAccountsAtom from './enabled-wallet-accounts.js'
import createWalletAccountsAtom from './wallet-accounts.js'
import createActiveWalletAccountAtom from './active-wallet-account.js'
import createMultipleWalletAccountsEnabledAtom from './multiple-wallet-accounts-enabled.js'
import createHardwareWalletPublicKeysAtom from './hardware-wallet-public-keys.js'
import createWalletAccountsInternalAtom from './wallet-accounts-internal.js'

export const walletAccountsAtomDefinition = {
  id: 'walletAccountsAtom',
  type: 'atom',
  factory: createWalletAccountsAtom,
  dependencies: ['walletAccountsInternalAtom'],
  public: true,
}

export const walletAccountsInternalAtomDefinition = {
  id: 'walletAccountsInternalAtom',
  type: 'atom',
  factory: createWalletAccountsInternalAtom,
  dependencies: ['storage', 'config'],
}

export const enabledWalletAccountsAtomDefinition = {
  id: 'enabledWalletAccountsAtom',
  type: 'atom',
  factory: createEnabledWalletAccountsAtom,
  dependencies: ['walletAccountsAtom'],
  public: true,
}

export const activeWalletAccountAtomDefinition = {
  id: 'activeWalletAccountAtom',
  type: 'atom',
  factory: createActiveWalletAccountAtom,
  dependencies: ['storage'],
  public: true,
}

export const multipleWalletAccountsEnabledAtomDefinition = {
  id: 'multipleWalletAccountsEnabledAtom',
  type: 'atom',
  factory: createMultipleWalletAccountsEnabledAtom,
  dependencies: ['fusion', 'logger'],
  public: true,
}

export const hardwareWalletPublicKeysAtomDefinition = {
  id: 'hardwareWalletPublicKeysAtom',
  type: 'atom',
  factory: createHardwareWalletPublicKeysAtom,
  dependencies: ['storage'],
  public: true,
}
