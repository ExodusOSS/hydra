import { SafeError } from '@exodus/errors'

const createBalancesReport = ({ enabledWalletAccountsAtom, balancesAtom }) => ({
  namespace: 'balances',
  export: async ({ walletExists } = Object.create(null)) => {
    if (!walletExists) return null

    let walletAccounts
    let balances

    try {
      ;[walletAccounts, { balances }] = await Promise.all([
        enabledWalletAccountsAtom.get(),
        balancesAtom.get(),
      ])
    } catch (error) {
      return { error: SafeError.from(error) }
    }

    return Object.keys(walletAccounts)
      .filter((key) => balances[key] && walletAccounts[key].source !== 'ftx')
      .reduce((data, key) => {
        const reportBalances = Object.fromEntries(
          Object.entries(balances[key])
            .filter(([_, value]) => !value.balance.isZero)
            .map(([key, value]) => {
              return [key, value.balance.toDefaultString({ unit: true })]
            })
        )

        data[key] = { balances: reportBalances }
        return data
      }, {})
  },
})

const balancesReportDefinition = {
  id: 'balancesReport',
  type: 'report',
  factory: createBalancesReport,
  dependencies: ['enabledWalletAccountsAtom', 'balancesAtom'],
  public: true,
}

export default balancesReportDefinition
