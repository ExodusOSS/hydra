import type { Definition } from '@exodus/dependency-types'
import createEnabledWalletAccountsAtom from './enabled-wallet-accounts.js'
import createWalletAccountsAtom from './wallet-accounts.js'
import createActiveWalletAccountAtom from './active-wallet-account.js'
import createMultipleWalletAccountsEnabledAtom from './multiple-wallet-accounts-enabled.js'
import createHardwareWalletPublicKeysAtom from './hardware-wallet-public-keys.js'
import createExternalWalletAddressesAtom from './external-wallet-addresses.js'
import createWalletAccountsInternalAtom from './wallet-accounts-internal.js'

export const walletAccountsAtomDefinition = {
  id: 'walletAccountsAtom',
  type: 'atom',
  factory: createWalletAccountsAtom,
  dependencies: ['walletAccountsInternalAtom'],
  public: true,
} as const satisfies Definition

export const walletAccountsInternalAtomDefinition = {
  id: 'walletAccountsInternalAtom',
  type: 'atom',
  factory: createWalletAccountsInternalAtom,
  dependencies: ['storage'],
} as const satisfies Definition

export const enabledWalletAccountsAtomDefinition = {
  id: 'enabledWalletAccountsAtom',
  type: 'atom',
  factory: createEnabledWalletAccountsAtom,
  dependencies: ['walletAccountsAtom'],
  public: true,
} as const satisfies Definition

export const activeWalletAccountAtomDefinition = {
  id: 'activeWalletAccountAtom',
  type: 'atom',
  factory: createActiveWalletAccountAtom,
  dependencies: ['storage'],
  public: true,
} as const satisfies Definition

export const multipleWalletAccountsEnabledAtomDefinition = {
  id: 'multipleWalletAccountsEnabledAtom',
  type: 'atom',
  factory: createMultipleWalletAccountsEnabledAtom,
  dependencies: ['fusion', 'logger'],
  public: true,
} as const satisfies Definition

export const hardwareWalletPublicKeysAtomDefinition = {
  id: 'hardwareWalletPublicKeysAtom',
  type: 'atom',
  factory: createHardwareWalletPublicKeysAtom,
  dependencies: ['storage'],
  public: true,
} as const satisfies Definition

export const externalWalletAddressesAtomDefinition = {
  id: 'externalWalletAddressesAtom',
  type: 'atom',
  factory: createExternalWalletAddressesAtom,
  dependencies: ['storage'],
  public: true,
} as const satisfies Definition
