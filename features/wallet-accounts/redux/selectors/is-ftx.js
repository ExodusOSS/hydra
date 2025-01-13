import { WalletAccount } from '@exodus/models'

const resultFunction = (get) => (name) => get(name)?.source === WalletAccount.FTX_SRC

const isFTXSelector = {
  id: 'isFTX',
  resultFunction,
  dependencies: [
    //
    { selector: 'get' },
  ],
}

export default isFTXSelector
