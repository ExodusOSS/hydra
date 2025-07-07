import { encryptGCM, decryptGCM } from '@exodus/crypto/aes'
import { randomBytes } from '@exodus/crypto/randomBytes'
import { hash } from '@exodus/crypto/hash'
import { scrypt } from '@exodus/crypto/scrypt'

// http://csrc.nist.gov/publications/nistpubs/800-38D/SP-800-38D.pdf 8.2.2 RBG-based Construction (about initialization vectors)
export const IV_LEN_BYTES = 12 // <-- always 12, any other value will error, not sure why it won't allow higher... probably concat with freefield?
const AUTH_TAG_LEN = 16
const KEY_LEN = 32 // we use aes-256-gcm

export function createScryptParams(params = {}) {
  return { salt: randomBytes(32), n: 16_384, r: 8, p: 1, ...params }
}

// always returns 32 byte key
export async function stretchPassphrase(passphrase, { salt, n, r, p } = createScryptParams()) {
  const key = await scrypt(passphrase, salt, { N: n, r, p, dkLen: 32 }, 'buffer')
  return { key, salt }
}

export async function aesEncrypt(key, message) {
  if (key.length !== KEY_LEN) throw new Error('Unexpected key size for aes-256')
  const iv = randomBytes(IV_LEN_BYTES)
  const merged = await encryptGCM({ data: message, key, nonce: iv, format: 'buffer' })
  const blob = merged.subarray(0, -AUTH_TAG_LEN)
  const authTag = merged.subarray(-AUTH_TAG_LEN)
  return { authTag, blob, iv }
}

export async function aesDecrypt(key, blob, { iv, authTag }) {
  if (key.length !== KEY_LEN) throw new Error('Unexpected key size for aes-256')
  return decryptGCM({ data: Buffer.concat([blob, authTag]), key, nonce: iv, format: 'buffer' })
}

export async function boxEncrypt(passphrase, message, scryptParams) {
  const { key, salt } = await stretchPassphrase(passphrase, scryptParams)
  const { authTag, blob, iv } = await aesEncrypt(key, message)
  return { authTag, blob, iv, salt }
}

export async function boxDecrypt(passphrase, blob, { iv, authTag }, scryptParams) {
  scryptParams = { ...createScryptParams(), ...scryptParams }
  const { key } = await stretchPassphrase(passphrase, scryptParams)
  return aesDecrypt(key, blob, { iv, authTag })
}

export async function sha256(message) {
  return hash('sha256', message)
}
