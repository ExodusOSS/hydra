declare module '@exodus/crypto/sodium-compat'
declare module '@exodus/crypto/randomBytes'

declare module 'features/wallet/module' {
  export interface Wallet {
    getPrimarySeedId(): Promise<SeedId>
  }
}

declare module '@exodus/keychain/module/crypto/sodium.js' {
  import type { KeySource } from './types.js'
  type GetPrivateKey = (keySource: KeySource) => { privateKey: Buffer }

  export type SodiumEncryptor = {
    encryptSecretBox(params: { data: Buffer } & KeySource): Promise<Buffer>
    decryptSecretBox(params: { data: Buffer } & KeySource): Promise<Buffer>
    encryptBox(params: { data: Buffer; toPublicKey: Buffer } & KeySource): Promise<Buffer>
    decryptBox(params: { data: Buffer; fromPublicKey: Buffer } & KeySource): Promise<Buffer>
  }

  export function create(params: { getPrivateHDKey: GetPrivateKey }): SodiumEncryptor
}
