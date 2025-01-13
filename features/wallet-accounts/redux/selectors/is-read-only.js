import { WalletAccount } from '@exodus/models'

const resultFunction = (getWalletAccount) => (name) => {
  const walletAccount = getWalletAccount(name)
  return walletAccount?.source === WalletAccount.TREZOR_SRC
}

const isReadOnlySelector = {
  id: 'isReadOnly',
  resultFunction,
  dependencies: [
    //
    { selector: 'get' },
  ],
}

export default isReadOnlySelector
