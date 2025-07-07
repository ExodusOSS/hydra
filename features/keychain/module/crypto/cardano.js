import { hash } from '@exodus/crypto/hash'
import { hmac } from '@exodus/crypto/hmac'
import { signDetached, edwardsToPublic } from '@exodus/crypto/curve25519'
import assert from 'minimalistic-assert'

const SEED_SIZE = 32

/**
 * Derives a Cardano V1 (Byron-era) private key seed.
 *
 * This function performs an iterative search for a valid Ed25519 seed by hashing and checking
 * the clamping condition on the resulting key. It follows the Byron-era derivation scheme.
 * @param {Uint8Array} seed - A 32-byte entropy seed, derived from a BIP39 mnemonic.
 * @returns {Promise<{ privateKey: Uint8Array, chainCode: Uint8Array }>}
 *          An object containing the 32-byte `privateKey` and `chainCode`.
 * @throws {TypeError} If the input is not a Uint8Array.
 * @throws {Error} If the input is not exactly 32 bytes.
 * @throws {Error} If a valid seed cannot be derived after 1000 iterations.
 * @see https://cardano-foundation.github.io/cardano-wallet/concepts/master-key-generation#byron
 */
async function seedToCardanoV1Seed(seed) {
  if (!(seed instanceof Uint8Array)) {
    throw new TypeError('Seed expected to be a Uint8Array')
  }

  if (seed.length !== SEED_SIZE) {
    throw new Error(`Seed must be exactly ${SEED_SIZE} bytes, but received ${seed.length}`)
  }

  for (let i = 1; i <= 1000; i++) {
    const digest = await hmac('sha512', seed, `Root Seed Chain ${i}`, 'uint8')
    const privateKey = digest.subarray(0, 32)
    const chainCode = digest.subarray(32, 64)

    const raw = await hash('sha512', privateKey, 'uint8')
    if (raw[31] & 0x20) continue

    return { privateKey, chainCode }
  }

  throw new Error('Secret key generation from mnemonic is looping forever')
}

/**
 * Derives the extended public key (XPUB) from a 32-byte entropy seed
 * using the Cardano V1 (Byron-era) derivation scheme.
 * @param {Uint8Array} seed - A 32-byte entropy seed, typically derived from a BIP39 mnemonic.
 * @returns {Promise<{ publicKey, chainCode }>}
 *          An object containing the derived Ed25519 public key and the corresponding chain code.
 * @throws {TypeError} If the input is not a Uint8Array.
 * @throws {Error} If the input seed is invalid or if derivation fails.
 */
export async function getCardanoV1ExtendedPublicKey(seed) {
  const { privateKey, chainCode } = await seedToCardanoV1Seed(seed)
  const publicKey = await edwardsToPublic({ privateKey, format: 'buffer' })
  return { publicKey, chainCode }
}

export const create = ({ getPrivateHDKey }) => {
  return Object.freeze({
    async signBuffer({ seedId, keyId, data }) {
      assert(
        keyId.keyType === 'cardanoByron',
        `ED25519 signatures are not supported for ${keyId.keyType}`
      )

      const { privateKey: seed } = getPrivateHDKey({ seedId, keyId })
      const { privateKey } = await seedToCardanoV1Seed(seed)

      return signDetached({ message: data, privateKey, format: 'buffer' })
    },
  })
}
