import { filter } from '@exodus/atoms'
import type { WalletAccountsInternalAtom } from '../types.js'

// for read-only usage
// modules like txLogsMonitors should wait atom observer to emit any account before start
export default function createWalletAccountsAtom({
  walletAccountsInternalAtom,
}: {
  walletAccountsInternalAtom: WalletAccountsInternalAtom
}) {
  return filter(walletAccountsInternalAtom, (value) => !!value)
}
