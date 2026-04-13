import type { WalletAccount } from '@exodus/models'

const resultFunction = (get: (name: string) => WalletAccount | undefined) => (name: string) =>
  get(name)?.isCustodial ?? false

export default {
  id: 'isCustodial',
  resultFunction,
  dependencies: [
    //
    { selector: 'get' },
  ],
} as const
