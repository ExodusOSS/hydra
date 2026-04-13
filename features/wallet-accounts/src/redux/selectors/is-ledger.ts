import { WalletAccount } from '@exodus/models'

const resultFunction =
  (getWalletAccount: (name: string) => WalletAccount | undefined) => (name: string) => {
    const walletAccount = getWalletAccount(name)
    return walletAccount?.source === WalletAccount.LEDGER_SRC
  }

const isLedgerSelector = {
  id: 'isLedger',
  resultFunction,
  dependencies: [
    //
    { selector: 'get' },
  ],
} as const

export default isLedgerSelector
