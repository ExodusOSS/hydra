import { filter } from '@exodus/atoms'

// for read-only usage
// modules like txLogsMonitors should wait atom observer to emit any account before start
export default function createWalletAccountsAtom({ walletAccountsInternalAtom }) {
  return filter(walletAccountsInternalAtom, (value) => !!value)
}
