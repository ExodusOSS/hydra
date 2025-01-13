import { memoize } from '@exodus/basic-utils'
import { HDKey } from './hdkey.js'

export { HARDENED_OFFSET } from './hdkey.js'

// TODO: remove 'versions' argument in next major, it's unused by apps
export function fromMasterSeed(seedBuffer, versions) {
  return BIP32.create(HDKey.fromMasterSeed(seedBuffer, versions))
}

// TODO: consider adding 'path' parameter representing absolute path from master seed
export default class BIP32 {
  #hdkey

  // TODO: make private in the next semver-major (allow only built-in HDKey via an instanceof check)
  constructor(hdkey) {
    this.#hdkey = hdkey
  }

  // TODO: remove in next semver-major
  static create(hdkey) {
    return new BIP32(hdkey)
  }

  // TODO: used only in one test, remove, this is confusing
  static fromJSON(jsonStrOrObj) {
    const { xpriv } = typeof jsonStrOrObj === 'string' ? JSON.parse(jsonStrOrObj) : jsonStrOrObj
    return HDKey.fromXPriv(xpriv)
  }

  static fromXPub(base58xpub, { skipVerification = false } = {}) {
    // TODO: perform actual pub (pub/priv) check in HDKey.fromExtendedKey in next major
    const hdkey = HDKey.fromExtendedKey(base58xpub, skipVerification)
    return new BIP32(hdkey)
  }

  static fromPublicKeyAndChainCode(publicKey, chainCode) {
    const hdkey = new HDKey()
    hdkey.publicKey = publicKey
    hdkey.chainCode = chainCode
    return new BIP32(hdkey)
  }

  static memoizedFromXPub = memoize(BIP32.fromXPub)

  static fromXPriv(base58xpriv) {
    // TODO: perform actual priv (pub/priv) check in HDKey.fromExtendedKey in next major
    return new BIP32(HDKey.fromExtendedKey(base58xpriv))
  }

  derive(numOrPath) {
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
