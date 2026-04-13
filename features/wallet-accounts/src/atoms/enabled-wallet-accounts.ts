import { compute } from '@exodus/atoms'
import type { WalletAccount } from '@exodus/models'
import type { WalletAccountsAtom } from '../types.js'

export default function createEnabledWalletAccountsAtom({
  walletAccountsAtom,
}: {
  walletAccountsAtom: WalletAccountsAtom
}) {
  const selector = (values: Record<string, WalletAccount>) =>
    Object.fromEntries(
      Object.entries(values).filter(([, account]: [string, WalletAccount]) => account.enabled)
    )

  return compute({ atom: walletAccountsAtom, selector })
}
