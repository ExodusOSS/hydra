import { WalletAccount } from '@exodus/models'

const resultFunction = (get: (name: string) => WalletAccount | undefined) => (name: string) =>
  get(name)?.source === WalletAccount.FTX_SRC

const isFTXSelector = {
  id: 'isFTX',
  resultFunction,
  dependencies: [
    //
    { selector: 'get' },
  ],
} as const

export default isFTXSelector
