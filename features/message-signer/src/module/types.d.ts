declare module '@exodus/module'
declare module '@exodus/storage-memory'
declare module '@exodus/dependency-injection'
declare module '@exodus/dependency-preprocessors'
declare module '@exodus/dependency-preprocessors/*'
declare module '@exodus/asset-lib'
declare module '@exodus/models/lib/wallet-account'
declare module '@exodus/key-identifier'
declare module '@exodus/keychain/module/crypto/seed-id'

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

    id?: string
    seedId?: string
    compatibilityMode?: string
    source: string
    index: number
    label: string

    get isSoftware(): boolean
    get isHardware(): boolean

    constructor(params: ConstructorParams)
  }
}
