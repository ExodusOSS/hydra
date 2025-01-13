import { mapValues } from '@exodus/basic-utils'

/**
 * sample report
 * {
 *    wallet_account_1: '50 USD',
 *    wallet_account_1: '0 USD'
 * }
 */
const fiatBalancesReportDefinition = {
  type: 'report',
  id: 'fiatBalancesReport',
  factory: ({ fiatBalancesAtom }) => ({
    namespace: 'fiatBalances',
    export: async () => {
      const result = await fiatBalancesAtom.get()
      return mapValues(result.balances.byWalletAccount, ({ balance }) =>
        balance.toDefaultString({ unit: true })
      )
    },
  }),
  dependencies: ['fiatBalancesAtom'],
}

export default fiatBalancesReportDefinition
