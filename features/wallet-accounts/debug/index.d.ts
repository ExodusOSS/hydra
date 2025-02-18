import type { WalletAccount } from '@exodus/models'

declare const walletAccountsDebugDefinition: {
  id: 'walletAccountsDebug'
  type: 'debug'
  factory(): {
    walletAccounts: {
      enableAll: () => Promise<void>
      disableAll: () => Promise<void>
      getAllWalletAccountsEver: () => Promise<WalletAccount[]>
    }
  }
}

export default walletAccountsDebugDefinition
