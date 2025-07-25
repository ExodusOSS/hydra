import assert from 'minimalistic-assert'
import { DerivationPath } from '@exodus/key-utils/src/derivation-path.js'

const SUPPORTED_KDFS = new Set(['BIP32', 'SLIP10'])
const SUPPORTED_KEY_TYPES = new Set(['legacy', 'nacl', 'secp256k1', 'cardanoByron'])

const isDerivationPath = (derivationPath) =>
  typeof derivationPath === 'object' &&
  Symbol.toStringTag in derivationPath &&
  (derivationPath[Symbol.toStringTag] === 'DerivationPath' ||
    (typeof derivationPath[Symbol.toStringTag] === 'function' &&
      derivationPath[Symbol.toStringTag]() === 'DerivationPath')) // an older version of DerivationPath incorrectly used a method instead of a getter

export default class KeyIdentifier {
  /** @type {DerivationPath} */
  #derivationPath

  constructor({ derivationAlgorithm, derivationPath, assetName, keyType }) {
    assert(typeof derivationAlgorithm === 'string', 'derivationAlgorithm not a string')
    assert(
      SUPPORTED_KDFS.has(derivationAlgorithm),
      `${derivationAlgorithm} is not a valid derivationAlgorithm`
    )

    assert(['string', 'undefined'].includes(typeof assetName), 'assetName was not a string')

    keyType = keyType || (derivationAlgorithm === 'SLIP10' ? 'nacl' : 'secp256k1')
    assert(SUPPORTED_KEY_TYPES.has(keyType), 'keyType was not a valid option')

    if (derivationAlgorithm === 'SLIP10') {
      // We can't turn secp256k1 into ed25119 keys for now, this is not used
      // anywhere but serves as an extra check to ensure it never happens in the
      // future. You can however have BIP32 keys with keyType nacl.
      assert(keyType !== 'secp256k1', 'secp256k1 requires BIP32 derivation')
    }

    this.derivationAlgorithm = derivationAlgorithm
    this.assetName = assetName
    this.keyType = keyType
    this.#derivationPath = isDerivationPath(derivationPath)
      ? derivationPath
      : DerivationPath.from(derivationPath)

    Object.defineProperty(this, 'derivationPath', {
      value: this.#derivationPath.toString(),
      enumerable: true,
    })

    // Freeze the object on construction, disallow tampering with derivation path.
    // Ensures immutability of key identifiers passed to keychain.
    Object.freeze(this)
  }

  derive(pathLike) {
    return new KeyIdentifier({
      ...this,
      derivationPath: this.#derivationPath.extend(pathLike),
    })
  }

  getPath() {
    return this.#derivationPath
  }

  toString() {
    return `${this.derivationPath} (${this.derivationAlgorithm})`
  }

  get [Symbol.toStringTag]() {
    return 'KeyIdentifier'
  }

  toJSON() {
    return {
      derivationAlgorithm: this.derivationAlgorithm,
      assetName: this.assetName,
      keyType: this.keyType,
      derivationPath: this.derivationPath,
    }
  }

  static validate = (potentialKeyIdentifier) => {
    try {
      // eslint-disable-next-line no-new
      new KeyIdentifier(potentialKeyIdentifier)
      return true
    } catch {
      return false
    }
  }

  static compare = (keyIdA, keyIdB) => {
    if (
      typeof keyIdA !== 'object' ||
      typeof keyIdB !== 'object' ||
      [keyIdA, keyIdB].includes(null)
    ) {
      return false
    }

    return !['derivationAlgorithm', 'derivationPath', 'assetName', 'keyType'].some(
      (fieldName) =>
        Object.prototype.hasOwnProperty.call(keyIdA, fieldName) &&
        Object.prototype.hasOwnProperty.call(keyIdB, fieldName) &&
        keyIdA[fieldName] !== keyIdB[fieldName]
    )
  }
}
