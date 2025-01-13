import { combine, compute, dedupe } from '@exodus/atoms'
import { mapValues } from '@exodus/basic-utils'

const computeFundedWalletAccounts = ({ walletAccounts, balances }) => {
  return mapValues(walletAccounts, (_, key) => {
    const walletAccountBalaces = balances.balances[key] || {}
    return Object.values(walletAccountBalaces).some(({ balance }) => !balance.isZero)
  })
}

const createFundedWalletAccountsAtom = ({ balancesAtom, enabledWalletAccountsAtom }) => {
  const walletAccountsBalanceAtom = combine({
    walletAccounts: enabledWalletAccountsAtom,
    balances: balancesAtom,
  })

  return dedupe(
    compute({
      atom: walletAccountsBalanceAtom,
      selector: computeFundedWalletAccounts,
    })
  )
}

export default createFundedWalletAccountsAtom
