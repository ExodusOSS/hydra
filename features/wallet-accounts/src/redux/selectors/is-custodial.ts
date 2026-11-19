import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'
import type { WalletAccount } from '@exodus/models'

const resultFunction =
  (get: (name: string) => WalletAccount | undefined) =>
  (name: string): boolean =>
    get(name)?.isCustodial ?? false

export default defineSelectorResultFunction({
  id: 'isCustodial',
  resultFunction,
  dependencies: [
    //
    { selector: 'get' },
  ],
})
