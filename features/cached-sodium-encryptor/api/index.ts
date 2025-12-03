import type { CachedSodiumEncryptor } from '../module/cached-sodium-encryptor.js'
import type { Definition } from '@exodus/dependency-types'

type Dependencies = {
  cachedSodiumEncryptor: CachedSodiumEncryptor
}

const createCachedSodiumEncryptorApi = ({ cachedSodiumEncryptor }: Dependencies) => {
  return {
    cachedSodiumEncryptor: {
      encryptSecretBox: cachedSodiumEncryptor.encryptSecretBox,
      decryptSecretBox: cachedSodiumEncryptor.decryptSecretBox,
      encryptBox: cachedSodiumEncryptor.encryptBox,
      decryptBox: cachedSodiumEncryptor.decryptBox,
    },
  }
}

export type CachedSodiumEncryptorApi = ReturnType<typeof createCachedSodiumEncryptorApi>

const cachedSodiumEncryptorApiDefinition = {
  id: 'cachedSodiumEncryptorApi',
  type: 'api',
  factory: createCachedSodiumEncryptorApi,
  dependencies: ['cachedSodiumEncryptor'],
} as const satisfies Definition

export default cachedSodiumEncryptorApiDefinition
