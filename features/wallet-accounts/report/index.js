import { WalletAccount } from '@exodus/models'

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
    const redactedData = Object.fromEntries(
      Object.entries(data).map(([key, walletAccount]) => [
        key,
        new WalletAccount({ ...walletAccount, label: '<Redacted>' }),
      ])
    )

    return {
      data: redactedData,
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
