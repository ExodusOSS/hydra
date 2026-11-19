import type { Definition } from '@exodus/dependency-types'

import createWalletAccountsPlugin from './lifecycle.js'
import createMultipleWalletAccountsAutoEnable from './multiple-wallet-accounts-plugin.js'

export const walletAccountsLifecyclePluginDefinition = {
  id: 'walletAccountsLifecyclePlugin',
  type: 'plugin',
  factory: createWalletAccountsPlugin,
  dependencies: [
    'port',
    'walletAccounts',
    'activeWalletAccountAtom',
    'hardwareWalletPublicKeysAtom',
    'multipleWalletAccountsEnabledAtom',
    'walletAccountsAtom',
    'enabledWalletAccountsAtom',
    'config',
    'errorTracking',
  ],
  public: true,
} as const satisfies Definition

export const multipleWalletAccountsPluginDefinition = {
  id: 'multipleWalletAccountsPlugin',
  type: 'plugin',
  factory: createMultipleWalletAccountsAutoEnable,
  dependencies: ['walletAccountsAtom', 'multipleWalletAccountsEnabledAtom'],
  public: true,
} as const satisfies Definition
