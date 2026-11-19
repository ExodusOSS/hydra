import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'
import type { WalletAccount } from '@exodus/models'

const resultFunction = (
  walletAccounts: string[],
  get: (name: string) => WalletAccount | undefined,
  multipleWalletAccountsEnabled: boolean | undefined
): string[] => {
  const enabledAccounts = walletAccounts.filter(
    (walletAccount: string) => get(walletAccount)?.enabled
  )

  return multipleWalletAccountsEnabled === false ? enabledAccounts.slice(0, 1) : enabledAccounts
}

export default defineSelectorResultFunction({
  id: 'enabled',
  resultFunction,
  dependencies: [
    //
    { selector: 'names' },
    { selector: 'get' },
    { selector: 'multipleWalletAccountsEnabled' },
  ],
})
