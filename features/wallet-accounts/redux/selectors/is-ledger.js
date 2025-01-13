import { WalletAccount } from '@exodus/models'

const resultFunction = (getWalletAccount) => (name) => {
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
}

export default isLedgerSelector
