import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'
import type { WalletAccount } from '@exodus/models'

// can't we just do Object.values(data) where data comes from { selector: 'data' }?
const resultFunction = (
  walletAccounts: string[],
  get: (name: string) => WalletAccount | undefined
): (WalletAccount | undefined)[] => walletAccounts.map(get)

export default defineSelectorResultFunction({
  id: 'all',
  resultFunction,
  dependencies: [
    //
    { selector: 'names' },
    { selector: 'get' },
  ],
})
