declare module '@exodus/trezor-events' {
  export class TrezorEvents {
    constructor(config: any)
    init(options: any): void
    deinit(): void
    initialize(): Promise<any>
    features(): Promise<any>
    applySettings(settings: any): Promise<any>
    getAddress(assetName: string, derivationPath: string, options: any): Promise<any>
    getXPub(derivationPath: string, options?: any): Promise<string>
    getPublicKey(derivationPath: string, assetName: string, options?: any): Promise<any>
    signTransaction(assetName: string, tx: any, derivationPath: any, options: any): Promise<any>
    cancelCurrentAction(): Promise<void>
    processThpCodeEntry(code: string): Promise<any>
    getThpCredentials(autoconnect?: boolean): Promise<any>
    device: {
      isPaired(): boolean
      descriptor: any
    }

    connected: boolean

    on(event: string | symbol, listener: (...args: any[]) => void): this
    once(event: string | symbol, listener: (...args: any[]) => void): this
    off(event: string | symbol, listener: (...args: any[]) => void): this
    emit(event: string | symbol, ...args: any[]): boolean
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this
    removeAllListeners(event?: string | symbol): this
  }
}

declare module '@exodus/trezor-meta' {
  export function createMeta(assets: Record<string, any>): {
    ASSETS_BY_MODEL: Record<string, string[]> & {
      'Safe 7': string[]
      'Safe 5': string[]
      'Safe 3': string[]
      T: string[]
      '1': string[]
    }
    FIRMWARE_ASSETS_BY_MODEL: Record<string, string[]> & {
      'Safe 5': string[]
      'Safe 3': string[]
      T: string[]
      '1': string[]
    }
    SUPPORTED_ASSETS: string[]
    SUPPORTED_ONLY_BY_MODEL_T: string[]
    FUTURE_SUPPORTED_ASSETS: string[]
    isSegwit(assetName: string): boolean
    isBip84(assetName: string): boolean
    isSupportedByTrezor(assetName: string): boolean
    isSupportedOnlyByModelT(assetName: string): boolean
  }
}
