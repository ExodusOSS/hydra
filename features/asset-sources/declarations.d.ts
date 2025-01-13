declare module '@exodus/models' {
  type ConstructorParams = {
    id?: string
    source: string
    index: number
    label?: string
    seedId?: string
    model?: string
  }

  export class WalletAccount {
    static readonly DEFAULT: WalletAccount
    static readonly DEFAULT_NAME: string
    static readonly LEDGER_SRC: string
    static readonly TREZOR_SRC: string

    id?: string
    seedId?: string
    compatibilityMode?: string
    isMultisig?: boolean
    source: string
    index: number
    label?: string
    model?: string

    get isSoftware(): boolean
    get isHardware(): boolean

    constructor({ source, index, label }: ConstructorParams)

    toString(): string
  }
}

declare module '@exodus/typeforce'
declare module '@exodus/trezor-meta'
declare module '@exodus/basic-utils'
