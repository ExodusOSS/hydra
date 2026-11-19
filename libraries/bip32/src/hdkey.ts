import assert from 'minimalistic-assert'
import { fromBase58checkSync, toBase58checkSync } from '@exodus/bytes/base58check.js'
import { hash, hashSync } from '@exodus/crypto/hash'
import { hmac, hmacSync } from '@exodus/crypto/hmac'
import { randomBytes } from '@exodus/crypto/randomBytes'
import * as secp256k1 from '@exodus/crypto/secp256k1'

import { concatSecret, copySecret, wipe } from './secure-buffer.js'

const MASTER_SECRET = Buffer.from('Bitcoin seed', 'utf8')
export const HARDENED_OFFSET = 0x80_00_00_00
const LEN = 78

export type Versions = { private: number; public: number }

// Bitcoin hardcoded by default, can use package `coininfo` for others
const BITCOIN_VERSIONS: Versions = { private: 0x04_88_ad_e4, public: 0x04_88_b2_1e }

// bip32 master
export async function getSeedId(seed: Uint8Array): Promise<string> {
  if (!(seed instanceof Uint8Array)) throw new Error('seed must be an Uint8Array instance')
  const vector = await hmac('sha512', MASTER_SECRET, seed, 'uint8') // const I from fromMasterSeed()

  try {
    const publicKey = secp256k1.privateKeyToPublicKey({ privateKey: vector.subarray(0, 32) })
    return hash('hash160', publicKey, 'hex')
  } finally {
    wipe(vector)
  }
}

export class HDKey {
  depth = 0
  index = 0
  chainCode: Buffer | null = null
  parentFingerprint = 0
  // Assigned in the constructor.
  declare versions: Versions
  #fingerprint = 0
  #identifier?: Buffer
  #privateKey: Buffer | null = null
  #publicKey: Buffer | null = null

  // TODO: make private in the next semver-major (allow only built-in HDKey via an instanceof check)
  constructor(versions?: Versions) {
    this.versions = versions || BITCOIN_VERSIONS
  }

  get fingerprint() {
    this.#ensurePublicKeyIsDerived()
    return this.#fingerprint
  }

  get identifier() {
    this.#ensurePublicKeyIsDerived()
    return this.#identifier
  }

  get privateKey() {
    return this.#privateKey
  }

  set privateKey(privateKey: Buffer | null) {
    assert(secp256k1.privateKeyIsValid({ privateKey }), 'invalid private key') // checks validity
    this.#privateKey = privateKey
  }

  /**
   * @param {Buffer|Uint8Array} publicKey - the public key to set
   * @param {boolean} [unsafeWipePrivateData] - Consult AppSec before overriding it.
   */
  #setPublicKey(publicKey: Uint8Array, unsafeWipePrivateData = true) {
    this.#publicKey = copySecret(publicKey)
    this.#identifier = hashSync('hash160', this.publicKey!)
    this.#fingerprint = this.#identifier.slice(0, 4).readUInt32BE(0)
    if (unsafeWipePrivateData) this.#wipePrivateData()
  }

  #ensurePublicKeyIsDerived() {
    if (!this.#publicKey && this.#privateKey) {
      this.#setPublicKey(
        secp256k1.privateKeyToPublicKey({ privateKey: this.#privateKey, format: 'buffer' }),
        false
      )
    }
  }

  get publicKey(): Buffer | null {
    this.#ensurePublicKeyIsDerived()
    return this.#publicKey
  }

  set publicKey(value: Uint8Array | null) {
    // non-null past the validity assert; the `!`s drop the nullable setter type
    assert(secp256k1.publicKeyIsValid({ publicKey: value }), 'Invalid public key')
    // force compressed point (performs public key verification)
    const publicKey =
      value!.length === 65
        ? secp256k1.publicKeyConvert({ publicKey: value!, compressed: true })
        : value!
    this.#setPublicKey(publicKey)
  }

  get privateExtendedKey() {
    if (!this.#privateKey) return null

    let key: Buffer | undefined
    let serialized: Buffer | undefined

    try {
      key = concatSecret(Buffer.alloc(1), this.#privateKey)
      serialized = this.#serialize(this.versions.private, key)
      return toBase58checkSync(serialized)
    } finally {
      wipe(key)
      wipe(serialized)
    }
  }

  get publicExtendedKey() {
    let serialized: Buffer | undefined

    try {
      serialized = this.#serialize(this.versions.public, this.publicKey!)
      return toBase58checkSync(serialized)
    } finally {
      wipe(serialized)
    }
  }

  derive(path: string): HDKey {
    if (path === 'm' || path === 'M' || path === "m'" || path === "M'") {
      return this
    }

    const entries = path.split('/')
    let hdkey: HDKey = this // oxlint-disable-line unicorn/no-this-assignment, typescript/no-this-alias
    entries.forEach(function (c, i) {
      if (i === 0) {
        assert(/^[Mm]/u.test(c), 'Path must start with "m" or "M"')
        return
      }

      const hardened = c.length > 1 && c[c.length - 1] === "'"
      let childIndex = parseInt(c, 10) // & (HARDENED_OFFSET - 1)
      assert(childIndex < HARDENED_OFFSET, 'Invalid index')
      if (hardened) childIndex += HARDENED_OFFSET

      hdkey = hdkey.deriveChild(childIndex)
    })

    return hdkey
  }

  deriveChild(index: number): HDKey {
    const isHardened = index >= HARDENED_OFFSET
    const indexBuffer = Buffer.alloc(4)
    indexBuffer.writeUInt32BE(index, 0)

    let data: Buffer | undefined
    let I: Uint8Array | undefined
    let IL: Buffer | undefined

    try {
      if (isHardened) {
        // Hardened child
        assert(this.privateKey, 'Could not derive hardened child key')

        // data = 0x00 || ser256(kpar) || ser32(index)
        data = concatSecret(Buffer.alloc(1), this.privateKey!, indexBuffer)
      } else {
        // Normal child
        // data = serP(point(kpar)) || ser32(index)
        //      = serP(Kpar) || ser32(index)
        data = concatSecret(this.publicKey!, indexBuffer)
      }

      I = hmacSync('sha512', this.chainCode!, data, 'uint8')
      IL = copySecret(I.subarray(0, 32))

      const hd = new HDKey(this.versions)

      // Private parent key -> private child key
      if (this.privateKey) {
        // ki = parse256(IL) + kpar (mod n)
        try {
          hd.privateKey = secp256k1.privateKeyTweakAdd({
            privateKey: this.privateKey,
            tweak: IL,
            format: 'buffer',
          })
          // throw if IL >= n || (privateKey + IL) === 0
        } catch {
          // In case parse256(IL) >= n or ki == 0, one should proceed with the next value for i
          return this.deriveChild(index + 1)
        }
        // Public parent key -> public child key
      } else {
        // Ki = point(parse256(IL)) + Kpar
        //    = G*IL + Kpar
        try {
          hd.publicKey = secp256k1.publicKeyTweakAddScalar({
            publicKey: this.publicKey!,
            tweak: IL,
            format: 'buffer',
          })
          // throw if IL >= n || (g**IL + publicKey) is infinity
        } catch {
          // In case parse256(IL) >= n or Ki is the point at infinity, one should proceed with the next value for i
          return this.deriveChild(index + 1)
        }
      }

      hd.chainCode = copySecret(I.subarray(32))
      hd.depth = this.depth + 1
      hd.parentFingerprint = this.fingerprint // .readUInt32BE(0)
      hd.index = index

      return hd
    } finally {
      wipe(data)
      wipe(I)
      wipe(IL)
    }
  }

  wipePrivateData() {
    // Ensure all public fields are computed - before wiping private data
    this.#ensurePublicKeyIsDerived()
    return this.#wipePrivateData()
  }

  #wipePrivateData() {
    if (this.#privateKey) randomBytes(this.#privateKey.length).copy(this.#privateKey)
    this.#privateKey = null
    return this
  }

  toJSON() {
    return {
      xpriv: this.privateExtendedKey,
      xpub: this.publicExtendedKey,
    }
  }

  static fromMasterSeed(seedBuffer: Uint8Array, versions?: Versions) {
    const I = hmacSync('sha512', MASTER_SECRET, seedBuffer, 'uint8')

    try {
      const hdkey = new HDKey(versions)
      hdkey.chainCode = copySecret(I.subarray(32))
      hdkey.privateKey = copySecret(I.subarray(0, 32))

      return hdkey
    } finally {
      wipe(I)
    }
  }

  static fromExtendedKey(base58key: string, skipVerification = false) {
    // => version(4) || depth(1) || fingerprint(4) || index(4) || chain(32) || key(33)
    const versions = BITCOIN_VERSIONS
    const hdkey = new HDKey(versions)

    const keyBuffer = fromBase58checkSync(base58key, 'buffer')

    try {
      const version = keyBuffer.readUInt32BE(0)
      assert(
        version === versions.private || version === versions.public,
        'Version mismatch: does not match private or public'
      )

      hdkey.depth = keyBuffer.readUInt8(4)
      hdkey.parentFingerprint = keyBuffer.readUInt32BE(5)
      hdkey.index = keyBuffer.readUInt32BE(9)
      hdkey.chainCode = copySecret(keyBuffer.subarray(13, 45))

      const key = keyBuffer.subarray(45)
      if (key.readUInt8(0) === 0) {
        // private
        assert(version === versions.private, 'Version mismatch: version does not match private')
        hdkey.privateKey = copySecret(key.subarray(1))
      } else {
        assert(version === versions.public, 'Version mismatch: version does not match public')
        if (skipVerification) {
          hdkey.#setPublicKey(key)
        } else {
          hdkey.publicKey = key
        }
      }

      return hdkey
    } finally {
      wipe(keyBuffer)
    }
  }

  #serialize(version: number, key: Buffer) {
    // => version(4) || depth(1) || fingerprint(4) || index(4) || chain(32) || key(33)
    const buffer = Buffer.alloc(LEN)

    buffer.writeUInt32BE(version, 0)
    buffer.writeUInt8(this.depth, 4)

    const fingerprint = this.depth ? this.parentFingerprint : 0x00_00_00_00
    buffer.writeUInt32BE(fingerprint, 5)
    buffer.writeUInt32BE(this.index, 9)

    this.chainCode!.copy(buffer, 13)
    key.copy(buffer, 45)

    return buffer
  }
}
