const sodium = require('@exodus/libsodium-wrappers')

const assert = (constraint, message) => {
  if (!constraint) throw new TypeError(message)
}

const toUint8Array = bufOrStr => {
  if (typeof bufOrStr === 'string') return sodium.from_hex(bufOrStr)
  if (Buffer.isBuffer(bufOrStr)) return Uint8Array.from(bufOrStr)
  if (bufOrStr instanceof Uint8Array) return bufOrStr

  throw new Error('expected Uint8Array, Buffer or hex string')
}

const normalizeKey = ({ publicKey, privateKey, ...rest }) => ({
  publicKey: Buffer.from(publicKey),
  privateKey: Buffer.from(privateKey),
  ...rest
})

const isBufferLike = (val) => val instanceof Uint8Array || Buffer.isBuffer(val)

async function getSodiumKeysFromSeed (derived) {
  await sodium.ready

  derived = toUint8Array(derived)

  return {
    box: normalizeKey(sodium.crypto_box_seed_keypair(derived)),
    sign: normalizeKey(sodium.crypto_sign_seed_keypair(derived)),
    secret: Buffer.from(sodium.crypto_generichash(32, derived)),
    derived: Buffer.from(derived)
  }
}

async function encryptSecret (message, secretKey) {
  await sodium.ready

  secretKey = toUint8Array(secretKey)

  const nonce = sodium.randombytes_buf(sodium.crypto_secretbox_NONCEBYTES)
  const ciphertext = sodium.crypto_secretbox_easy(message, nonce, secretKey)
  return Buffer.concat([nonce, ciphertext])
}

async function decryptSecret (ciphertextWithNonce, secretKey) {
  await sodium.ready

  ciphertextWithNonce = toUint8Array(ciphertextWithNonce)
  secretKey = toUint8Array(secretKey)

  if (
    ciphertextWithNonce.length <
    sodium.crypto_secretbox_NONCEBYTES + sodium.crypto_secretbox_MACBYTES
  ) {
    throw new Error('Encrypted data too short')
  }
  const [nonce, ciphertext] = await _splitNonceFromMessage(
    ciphertextWithNonce,
    sodium.crypto_secretbox_NONCEBYTES
  )
  const decrypted = sodium.crypto_secretbox_open_easy(
    ciphertext,
    nonce,
    secretKey
  )
  return Buffer.from(decrypted)
}

async function encryptAEAD (message, secretKey, nonce, associatedData) {
  await sodium.ready

  assert(nonce.length === 12, 'expected 12-byte buffer')
  assert(secretKey.length === 32, 'expected 32-byte buffer')
  secretKey = toUint8Array(secretKey)

  const encrypted = sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
    message,
    associatedData,
    null, // secret nonce, not used
    nonce,
    secretKey
  )

  return Buffer.from(encrypted)
}

async function decryptAEAD (ciphertext, secretKey, nonce, associatedData) {
  await sodium.ready

  assert(nonce.length === 12, 'expected 12-byte buffer')
  assert(secretKey.length === 32, 'expected 32-byte buffer')
  secretKey = toUint8Array(secretKey)

  const decrypted = sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
    null, // secret nonce, not used
    ciphertext,
    associatedData,
    nonce,
    secretKey
  )

  return Buffer.from(decrypted)
}

async function encryptBox (message, toPublic, fromPrivate) {
  await sodium.ready

  toPublic = toUint8Array(toPublic)
  fromPrivate = toUint8Array(fromPrivate)

  const nonce = sodium.randombytes_buf(sodium.crypto_box_NONCEBYTES)
  const ciphertext = sodium.crypto_box_easy(
    message,
    nonce,
    toPublic,
    fromPrivate
  )
  return Buffer.concat([nonce, ciphertext])
}

async function decryptBox (ciphertextWithNonce, fromPublic, toPrivate) {
  await sodium.ready

  fromPublic = toUint8Array(fromPublic)
  toPrivate = toUint8Array(toPrivate)

  const [nonce, ciphertext] = await _splitNonceFromMessage(
    ciphertextWithNonce,
    sodium.crypto_box_NONCEBYTES
  )
  const decrypted = sodium.crypto_box_open_easy(
    ciphertext,
    nonce,
    fromPublic,
    toPrivate
  )
  return Buffer.from(decrypted)
}

async function encryptSealedBox (message, toPublic) {
  await sodium.ready
  toPublic = toUint8Array(toPublic)

  const encrypted = sodium.crypto_box_seal(message, toPublic)
  return Buffer.from(encrypted)
}

async function decryptSealedBox (ciphertext, toPublic, toPrivate) {
  await sodium.ready
  toPublic = toUint8Array(toPublic)
  toPrivate = toUint8Array(toPrivate)

  const decrypted = sodium.crypto_box_seal_open(ciphertext, toPublic, toPrivate)
  return Buffer.from(decrypted)
}

async function convertPublicKeyToX25519 (publicKey) {
  await sodium.ready
  publicKey = toUint8Array(publicKey)
  return sodium.crypto_sign_ed25519_pk_to_curve25519(publicKey)
}

async function convertPrivateKeyToX25519 (privateKey) {
  await sodium.ready
  privateKey = toUint8Array(privateKey)
  return sodium.crypto_sign_ed25519_sk_to_curve25519(privateKey)
}

async function _splitNonceFromMessage (messageWithNonce, bytes) {
  const nonce = messageWithNonce.slice(0, bytes)
  const message = messageWithNonce.slice(bytes, messageWithNonce.length)
  return [nonce, message]
}

async function genBoxKeyPair (randomBytes) {
  randomBytes = toUint8Array(randomBytes)

  if (!(randomBytes && randomBytes.length === 32)) {
    throw new Error('expected 32 bytes of randomness as input')
  }

  await sodium.ready
  const { keyType, privateKey, publicKey } = sodium.crypto_box_seed_keypair(
    randomBytes
  )
  return {
    curve: keyType,
    privateKey: Buffer.from(privateKey),
    publicKey: Buffer.from(publicKey)
  }
}

async function genSignKeyPair (randomBytes) {
  randomBytes = toUint8Array(randomBytes)
  assert(randomBytes.length === 32, 'expected 32-byte buffer')

  await sodium.ready
  return normalizeKey(sodium.crypto_sign_seed_keypair(randomBytes))
}

const signDetached = async ({ message, privateKey }) => {
  assert(isBufferLike(message), 'expected Buffer "message"')
  assert(isBufferLike(privateKey), 'expected Buffer "privateKey"')

  await sodium.ready
  const outputFormat = 'uint8array'
  const sig = sodium.crypto_sign_detached(toUint8Array(message), toUint8Array(privateKey), outputFormat)
  return Buffer.from(sig)
}

const verifyDetached = async ({ message, sig, publicKey }) => {
  assert(isBufferLike(message), 'expected Buffer "message"')
  assert(isBufferLike(sig), 'expected Buffer "sig"')
  assert(isBufferLike(publicKey), 'expected Buffer "publicKey"')

  await sodium.ready
  return sodium.crypto_sign_verify_detached(toUint8Array(sig), message, toUint8Array(publicKey))
}

const sign = async ({ message, privateKey }) => {
  assert(isBufferLike(message), 'expected Buffer "message"')
  assert(isBufferLike(privateKey), 'expected Buffer "privateKey"')

  await sodium.ready
  const outputFormat = 'uint8array'
  const sig = sodium.crypto_sign(toUint8Array(message), toUint8Array(privateKey), outputFormat)
  return Buffer.from(sig)
}

const signOpen = async ({ signed, publicKey }) => {
  assert(isBufferLike(signed), 'expected Buffer "signed"')
  assert(isBufferLike(publicKey), 'expected Buffer "publicKey"')

  await sodium.ready
  const result = sodium.crypto_sign_open(toUint8Array(signed), toUint8Array(publicKey), 'uint8array')
  return Buffer.from(result)
}

const pwhash = async ({ data, salt }) => {
  assert(isBufferLike(data), 'expected Buffer "data"')
  assert(isBufferLike(salt), 'expected Buffer "salt"')
  assert(salt.length === 16, 'expected crypto_pwhash_SALTBYTES')

  await sodium.ready
  // hardcoding many values here to ensure future compat if we upgrade libsodium and defaults change
  const hashed = sodium.crypto_pwhash(
    32, // calculate a 256 bit hash
    toUint8Array(data),
    toUint8Array(salt),
    2, // sodium.crypto_pwhash_OPSLIMIT_INTERACTIVE
    67108864, // sodium.crypto_pwhash_MEMLIMIT_INTERACTIVE
    2 // sodium.crypto_pwhash_ALG_ARGON2ID13
  )

  return Buffer.from(hashed)
}

module.exports = {
  getSodiumKeysFromSeed,
  encryptSecret,
  decryptSecret,
  encryptAEAD,
  decryptAEAD,
  encryptBox,
  decryptBox,
  encryptSealedBox,
  decryptSealedBox,
  convertPublicKeyToX25519,
  convertPrivateKeyToX25519,
  signDetached,
  verifyDetached,
  sign,
  signOpen,
  genBoxKeyPair,
  genSignKeyPair,
  pwhash
}
