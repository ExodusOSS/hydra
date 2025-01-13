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
    'wallet',
  ],
  public: true,
}

export const multipleWalletAccountsPluginDefinition = {
  id: 'multipleWalletAccountsPlugin',
  type: 'plugin',
  factory: createMultipleWalletAccountsAutoEnable,
  dependencies: ['walletAccountsAtom', 'multipleWalletAccountsEnabledAtom'],
  public: true,
}
