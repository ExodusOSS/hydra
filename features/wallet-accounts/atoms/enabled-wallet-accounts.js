import { compute } from '@exodus/atoms'

export default function createEnabledWalletAccountsAtom({ walletAccountsAtom }) {
  const selector = (values) =>
    Object.fromEntries(Object.entries(values).filter(([, account]) => account.enabled))

  return compute({ atom: walletAccountsAtom, selector })
}
