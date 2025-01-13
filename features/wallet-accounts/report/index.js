const createWalletAccountsReport = ({
  walletAccountsAtom,
  activeWalletAccountAtom,
  multipleWalletAccountsEnabledAtom,
}) => ({
  namespace: 'walletAccounts',
  export: async () => {
    const [data, configuredActiveWalletAccount, multipleWalletAccountsEnabled] = await Promise.all([
      walletAccountsAtom.get(),
      activeWalletAccountAtom.get(),
      multipleWalletAccountsEnabledAtom.get(),
    ])
    return {
      data,
      configuredActiveWalletAccount,
      multipleWalletAccountsEnabled,
    }
  },
})

const walletAccountsReportDefinition = {
  id: 'walletAccountsReport',
  type: 'report',
  factory: createWalletAccountsReport,
  dependencies: [
    'walletAccountsAtom',
    'activeWalletAccountAtom',
    'multipleWalletAccountsEnabledAtom',
  ],
  public: true,
}

export default walletAccountsReportDefinition
