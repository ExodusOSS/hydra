import type { Keychain, KeySource } from './types.js'
import type { Definition } from '@exodus/dependency-types'
import restrictConcurrency from 'make-concurrent'
import { getCacheKey } from './cache.js'
import * as sodium from '@exodus/crypto/sodium-compat'
import { EXODUS_KEY_IDS } from '@exodus/key-ids'
import { memoize } from '@exodus/basic-utils'
import KeyIdentifier from '@exodus/key-identifier'
import assert from 'minimalistic-assert'
import {
  decryptBoxParamsSchema,
  decryptSecretBoxParamsSchema,
  encryptBoxParamsSchema,
  encryptSecretBoxParamsSchema,
  validated,
} from './schemas.js'

type Dependencies = {
  keychain: Keychain
}

const getSecretKey = memoize(
  async (sodiumSeed: Buffer) => {
    const { secret } = await sodium.getSodiumKeysFromSeed(sodiumSeed)
    return secret
  },
  (key) => key.toString('hex')
)

export const ALLOWED_KEY_IDS = [
  // 'WALLET_INFO' is used for secure storage - everything that's not the seed/private keys. Examples: tx-history, address cache, nfts, etc.
  // for historical reasons, secure storage is unlocked only once during the runtime lifecycle of the application, and never re-locked.
  EXODUS_KEY_IDS.WALLET_INFO,
  EXODUS_KEY_IDS.FUSION,
]

export class CachedSodiumEncryptor {
  readonly #keychain: Keychain
  readonly #cache = new Map<string, Buffer>()

  constructor({ keychain }: Dependencies) {
    this.#keychain = keychain
  }

  async #derivePrivateKey({ keyId, seedId }: KeySource) {
    const { privateKey } = await this.#keychain.exportKey({ keyId, seedId, exportPrivate: true })
    return privateKey
  }

  #checkIfAllowed = ({ keyId }: KeySource) => {
    return ALLOWED_KEY_IDS.some((allowedKeyId) => KeyIdentifier.compare(allowedKeyId, keyId))
  }

  #getPrivateKey = restrictConcurrency(async (params: KeySource) => {
    assert(this.#checkIfAllowed(params), 'Key source not allowed for caching.')

    const cacheKey = getCacheKey(params)
    if (!this.#cache.has(cacheKey)) {
      this.#cache.set(cacheKey, await this.#derivePrivateKey(params))
    }

    return this.#cache.get(cacheKey)
  }) as (keySource: KeySource) => Promise<Buffer>

  encryptSecretBox = validated(async (params): Promise<Buffer> => {
    const privateKey = await this.#getPrivateKey(params)
    const encryptionKey = params.deriveSecret ? await getSecretKey(privateKey) : privateKey

    return sodium.encryptSecret(params.data, encryptionKey)
  }, encryptSecretBoxParamsSchema)

  decryptSecretBox = validated(async (params): Promise<Buffer> => {
    const privateKey = await this.#getPrivateKey(params)
    const encryptionKey = params.deriveSecret ? await getSecretKey(privateKey) : privateKey

    return sodium.decryptSecret(params.data, encryptionKey)
  }, decryptSecretBoxParamsSchema)

  encryptBox = validated(async (params): Promise<Buffer> => {
    const privateKey = await this.#getPrivateKey(params)
    const { box } = await sodium.getSodiumKeysFromSeed(privateKey)

    return sodium.encryptBox(params.data, params.toPublicKey, box.privateKey)
  }, encryptBoxParamsSchema)

  decryptBox = validated(async (params): Promise<Buffer> => {
    const privateKey = await this.#getPrivateKey(params)
    const { box } = await sodium.getSodiumKeysFromSeed(privateKey)

    return sodium.decryptBox(params.data, params.fromPublicKey, box.privateKey)
  }, decryptBoxParamsSchema)
}

const createCachedSodiumEncryptor = (opts: Dependencies) => new CachedSodiumEncryptor(opts)

const cachedSodiumEncryptorDefinition = {
  id: 'cachedSodiumEncryptor',
  type: 'module',
  factory: createCachedSodiumEncryptor,
  dependencies: ['keychain'],
  public: true,
} as const satisfies Definition

export default cachedSodiumEncryptorDefinition
