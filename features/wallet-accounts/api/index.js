const walletAccountsApi = ({
  walletAccounts,
  enabledWalletAccountsAtom,
  multipleWalletAccountsEnabledAtom,
}) => ({
  walletAccounts: {
    create: walletAccounts.create,
    update: walletAccounts.update,
    disable: walletAccounts.disable,
    disableMany: walletAccounts.disableMany,
    removeMany: walletAccounts.removeMany,
    enable: walletAccounts.enable,
    getEnabled: enabledWalletAccountsAtom.get,
    getActive: walletAccounts.getActive,
    setActive: walletAccounts.setActive,
    setMultipleEnabled: (value) => multipleWalletAccountsEnabledAtom.set(value),
  },
})

// eslint-disable-next-line @exodus/export-default/named
export default {
  id: 'walletAccountsApi',
  type: 'api',
  factory: walletAccountsApi,
  dependencies: [
    'walletAccounts',
    'enabledWalletAccountsAtom',
    'multipleWalletAccountsEnabledAtom',
  ],
}
