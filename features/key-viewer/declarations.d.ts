declare module '@exodus/models' {
  type ConstructorParams = {
    id?: string
    source: string
    index: number
    label?: string
    seedId?: string
  }

  export class WalletAccount {
    static readonly DEFAULT: WalletAccount
    static readonly DEFAULT_NAME: string
    static readonly TREZOR_SRC: string

    id?: string
    seedId?: string
    compatibilityMode?: string
    source: string
    index: number
    label?: string

    get isSoftware(): boolean
    get isHardware(): boolean

    constructor({ source, index, label }: ConstructorParams)

    toString(): string
  }

  export class Address {
    address: string
    meta: {
      path: string
    }

    toString(): string
  }
}

declare module '@exodus/address-provider/utils' {
  import type { Asset } from './module/interfaces.js'
  import type { WalletAccount } from '@exodus/models'

  export function getDefaultPurpose(params: { asset: Asset; walletAccount: WalletAccount }): number
}

declare module '@exodus/asset-lib' {
  import type { Asset } from './module/interfaces.js'
  import type { WalletAccount } from '@exodus/models'

  export function getDefaultPathIndexes(params: {
    asset: Asset
    walletAccount: WalletAccount
    compatibilityMode?: string
  })
}

declare module '@exodus/address-provider/module'

declare module '@exodus/key-utils' {
  export function getSeedId(seed: Buffer): string
}

declare module '@exodus/bitcoin-plugin'
