declare module '@exodus/models' {
  type ConstructorParams = {
    id?: string
    seedId?: string
    source: string
    index: number
    label?: string
  }

  export class WalletAccount {
    static readonly DEFAULT: WalletAccount
    static readonly DEFAULT_NAME: string

    static readonly EXODUS_SRC: string
    static readonly TREZOR_SRC: string

    id?: string
    seedId?: string
    source: string
    index: number
    label: string
    compatibilityMode?: string

    get isHardware(): boolean
    get isSoftware(): boolean

    constructor({ source, index, label }: ConstructorParams)

    toString(): string
  }
}

declare module '@exodus/bitcoin-plugin'
declare module '@exodus/bip32'
declare module '@exodus/asset-lib'
declare module '@exodus/keychain/module/crypto/seed-id'
declare module 'bip32-path'
declare module 'bip39'
