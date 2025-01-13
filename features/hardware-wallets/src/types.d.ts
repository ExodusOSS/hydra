declare module '@exodus/storage-memory'
declare module '@exodus/dependency-injection'
declare module '@exodus/dependency-preprocessors'
declare module '@exodus/dependency-preprocessors/*'
declare module '@exodus/asset-lib'
declare module '@exodus/models/lib/wallet-account'
declare module '@exodus/basic-utils'
declare module '@exodus/bip32'
declare module '@exodus/key-utils'
declare module '@exodus/assets'
declare module '@exodus/bitcoin-plugin'
declare module '@exodus/solana-plugin'
declare module '@exodus/trezor-events'
declare module '@exodus/crypto/randomBytes'

declare module '@exodus/key-identifier' {
  type ConstructorParams = {
    derivationPath: string
    keyType: string
    derivationAlgorithm: string
  }

  export default class KeyIdentifier {
    derivationPath: string
    keyType: string
    derivationAlgorithm: string

    constructor(params: ConstructorParams)
  }
}

declare module '@exodus/models' {
  type ConstructorParams = {
    id?: string
    source: string
    index: number
    icon?: string
    label?: string
    compatibilityMode?: string
    model?: string
    seedId?: string
    isMultisig: boolean
  }

  export class WalletAccount {
    static readonly DEFAULT: WalletAccount
    static readonly DEFAULT_NAME: 'exodus_0'

    static readonly EXODUS_SRC: string
    static readonly TREZOR_SRC: string
    static readonly LEDGER_SRC: string
    static readonly SEED_SRC: string

    id?: string
    seedId?: string
    compatibilityMode?: string
    model?: string
    source: string
    index: number
    label: string
    isMultisig: boolean

    get isHardware(): boolean

    constructor(params: ConstructorParams)

    toString(): string
  }
}
