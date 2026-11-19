import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'
import type { WalletAccount } from '@exodus/models'

const resultFunction =
  (walletAccounts: Record<string, WalletAccount>) =>
  (name: string): WalletAccount | undefined =>
    walletAccounts[name]

export default defineSelectorResultFunction({
  id: 'get',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
  ],
})
