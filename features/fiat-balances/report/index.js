import { mapValues, pick, pickBy } from '@exodus/basic-utils'

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
  factory: ({ wallet, walletAccountsAtom, fiatBalancesAtom }) => ({
    namespace: 'fiatBalances',
    export: async ({ walletExists } = Object.create(null)) => {
      if (!walletExists) return Object.create(null)

      const [walletAccounts, { balances }] = await Promise.all([
        walletAccountsAtom.get(),
        fiatBalancesAtom.get(),
      ])

      const softwareWalletAccountNames = Object.keys(pickBy(walletAccounts, (w) => w.isSoftware))
      return mapValues(pick(balances.byWalletAccount, softwareWalletAccountNames), ({ balance }) =>
        balance.toDefaultString({ unit: true })
      )
    },
  }),
  dependencies: ['wallet', 'fiatBalancesAtom', 'walletAccountsAtom'],
}

export default fiatBalancesReportDefinition
