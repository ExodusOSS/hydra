import { memoize } from '@exodus/basic-utils'
import { HDKey, type Versions } from './hdkey.js'
import { copySecret } from './secure-buffer.js'

export { HARDENED_OFFSET, getSeedId } from './hdkey.js'

// TODO: remove 'versions' argument in next major, it's unused by apps
export function fromMasterSeed(seedBuffer: Uint8Array, versions?: Versions) {
  return BIP32.create(HDKey.fromMasterSeed(seedBuffer, versions))
}

// Callable shape (with `reset()`) of the memoized `fromXPub`.
interface MemoizedFromXPub {
  (base58xpub: string, options?: { skipVerification?: boolean }): BIP32
  reset: () => void
}

// TODO: consider adding 'path' parameter representing absolute path from master seed
export default class BIP32 {
  #hdkey: HDKey

  // TODO: make private in the next semver-major (allow only built-in HDKey via an instanceof check)
  constructor(hdkey: HDKey) {
    this.#hdkey = hdkey
  }

  // TODO: remove in next semver-major
  static create(hdkey: HDKey) {
    return new BIP32(hdkey)
  }

  static fromXPub(
    base58xpub: string,
    { skipVerification = false }: { skipVerification?: boolean } = Object.create(null)
  ) {
    // TODO: perform actual pub (pub/priv) check in HDKey.fromExtendedKey in next major
    const hdkey = HDKey.fromExtendedKey(base58xpub, skipVerification)
    return new BIP32(hdkey)
  }

  static fromPublicKeyAndChainCode(publicKey: Uint8Array, chainCode: Buffer) {
    const hdkey = new HDKey()
    hdkey.publicKey = publicKey
    hdkey.chainCode = copySecret(chainCode)
    return new BIP32(hdkey)
  }

  // Cache key must include `skipVerification` so a prior call with
  // `skipVerification: true` cannot return its unverified instance to a later
  // call that expects full secp256k1 verification.
  static memoizedFromXPub: MemoizedFromXPub = memoize(
    BIP32.fromXPub,
    (
      base58xpub: string,
      { skipVerification = false }: { skipVerification?: boolean } = Object.create(null)
    ) => `${skipVerification ? '1' : '0'}|${base58xpub}`
  )

  static fromXPriv(base58xpriv: string) {
    // TODO: perform actual priv (pub/priv) check in HDKey.fromExtendedKey in next major
    return new BIP32(HDKey.fromExtendedKey(base58xpriv))
  }

  derive(numOrPath: number | string) {
    if (typeof numOrPath === 'number') {
      if (!Number.isSafeInteger(numOrPath)) throw new RangeError('number must be safe integer')
      return new BIP32(this.#hdkey.deriveChild(numOrPath))
    }

    if (typeof numOrPath === 'string') {
      return new BIP32(this.#hdkey.derive(numOrPath))
    }

    throw new TypeError('unknown type, expected a number or a path')
  }

  wipePrivateData() {
    this.#hdkey.wipePrivateData()
  }

  // Warning: has xpriv
  inspect() {
    return this.toJSON()
  }

  // Warning: has xpriv
  toJSON() {
    return this.#hdkey.toJSON()
  }

  // Warning: has xpriv
  toString() {
    return JSON.stringify(this.inspect(), null, 2)
  }

  get privateKey() {
    return this.#hdkey.privateKey
  }

  get publicKey() {
    return this.#hdkey.publicKey
  }

  get chainCode() {
    return this.#hdkey.chainCode
  }

  get xPub() {
    return this.#hdkey.publicExtendedKey
  }

  get identifier() {
    return this.#hdkey.identifier
  }

  get fingerprint() {
    return this.#hdkey.fingerprint
  }
}
