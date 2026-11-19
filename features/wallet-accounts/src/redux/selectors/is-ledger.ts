import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'
import { WalletAccount } from '@exodus/models'

const resultFunction =
  (getWalletAccount: (name: string) => WalletAccount | undefined) =>
  (name: string): boolean => {
    const walletAccount = getWalletAccount(name)
    return walletAccount?.source === WalletAccount.LEDGER_SRC
  }

const isLedgerSelector = defineSelectorResultFunction({
  id: 'isLedger',
  resultFunction,
  dependencies: [
    //
    { selector: 'get' },
  ],
})

export default isLedgerSelector
