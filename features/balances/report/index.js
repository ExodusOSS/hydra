const createBalancesReport = ({ enabledWalletAccountsAtom, balancesAtom }) => ({
  namespace: 'balances',
  export: async () => {
    let walletAccounts
    let balances

    try {
      ;[walletAccounts, { balances }] = await Promise.all([
        enabledWalletAccountsAtom.get(),
        balancesAtom.get(),
      ])
    } catch (error) {
      return { error }
    }

    return Object.keys(walletAccounts)
      .filter((key) => walletAccounts[key].source !== 'ftx')
      .reduce((data, key) => {
        if (!balances[key]) {
          data[key] = { error: 'No balances' }
          return data
        }

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
