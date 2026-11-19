import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'
import { WalletAccount } from '@exodus/models'

const resultFunction =
  (get: (name: string) => WalletAccount | undefined) =>
  (name: string): boolean =>
    get(name)?.source === WalletAccount.FTX_SRC

const isFTXSelector = defineSelectorResultFunction({
  id: 'isFTX',
  resultFunction,
  dependencies: [
    //
    { selector: 'get' },
  ],
})

export default isFTXSelector
