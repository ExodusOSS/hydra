import type { WalletAccount } from '@exodus/models'

const resultFunction = (
  walletAccounts: string[],
  get: (name: string) => WalletAccount | undefined,
  multipleWalletAccountsEnabled: boolean | undefined
) => {
  const enabledAccounts = walletAccounts.filter(
    (walletAccount: string) => get(walletAccount)?.enabled
  )

  return multipleWalletAccountsEnabled ? enabledAccounts : enabledAccounts.slice(0, 1)
}

export default {
  id: 'enabled',
  resultFunction,
  dependencies: [
    //
    { selector: 'names' },
    { selector: 'get' },
    { selector: 'multipleWalletAccountsEnabled' },
  ],
} as const
