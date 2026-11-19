// Ambient declarations for dependencies that ship no types.

declare module 'bip32-path' {
  interface BIPPath {
    toPathArray(): number[]
  }

  const BIPPath: {
    fromString(text: string, requireRoot?: boolean): BIPPath
  }

  export = BIPPath
}

declare module '@exodus/bip32' {
  export const HARDENED_OFFSET: number
  export function getSeedId(seed: Uint8Array): Promise<string>
}

declare module '@exodus/bip39' {
  export function mnemonicToSeed(options: {
    mnemonic: string
    password?: string
  }): Promise<Uint8Array>
}
