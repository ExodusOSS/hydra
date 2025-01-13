declare module '@exodus/keychain/module/crypto/seed-id'
declare module '@exodus/storage-memory' {
  import { Storage } from '@exodus/storage-interface'

  export default function createInMemoryStorage<Value>(params?: { store?: unknown }): Storage<Value>
}

declare module '@exodus/keychain/module' {
  export interface SodiumEncryptor {
    encryptSecretBox: ({ seedId: string, data: Buffer }) => Promise<Buffer>
    decryptSecretBox: ({ seedId: string, data: Buffer }) => Promise<Buffer>
  }

  declare class Keychain {
    sodium: {
      createEncryptor: (args: { keyId: KeyIdentifier }) => SodiumEncryptor
    }

    addSeed: (seed: Buffer) => void
  }

  declare function createKeychain(args): Keychain

  type dependencies = string[]

  export default keychainDefinition = {
    id: string,
    type: string,
    factory: createKeychain,
    dependencies,
  }

  export function createKeyIdentifierForExodus(args: { exoType: string })
}
