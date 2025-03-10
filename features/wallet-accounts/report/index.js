import { mapValues } from '@exodus/basic-utils'

const createWalletAccountsReport = ({
  walletAccountsAtom,
  activeWalletAccountAtom,
  multipleWalletAccountsEnabledAtom,
}) => ({
  namespace: 'walletAccounts',
  export: async ({ walletExists } = Object.create(null)) => {
    if (!walletExists) return null

    const [walletAccounts, configuredActiveWalletAccount, multipleWalletAccountsEnabled] =
      await Promise.all([
        walletAccountsAtom.get(),
        activeWalletAccountAtom.get(),
        multipleWalletAccountsEnabledAtom.get(),
      ])

    const redactedData = mapValues(walletAccounts, (w) => w.toRedactedJSON())

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
