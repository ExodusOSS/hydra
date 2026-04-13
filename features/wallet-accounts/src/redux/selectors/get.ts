import type { WalletAccount } from '@exodus/models'

const resultFunction = (walletAccounts: Record<string, WalletAccount>) => (name: string) =>
  walletAccounts[name]

export default {
  id: 'get',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
} as const
