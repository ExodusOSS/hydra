import assert from 'minimalistic-assert'
import { DerivationPath } from '@exodus/key-utils'

export type DerivationAlgorithm = 'BIP32' | 'SLIP10'
export type KeyType = 'legacy' | 'nacl' | 'secp256k1' | 'cardanoByron'
export type PathIndex = number | string
export type PathLike = string | PathIndex[]

export type KeyIdentifierParams = {
  derivationAlgorithm: DerivationAlgorithm
  derivationPath: PathLike | DerivationPath
  assetName?: string
  keyType?: KeyType
}

const SUPPORTED_KDFS = new Set<DerivationAlgorithm>(['BIP32', 'SLIP10'])
const SUPPORTED_KEY_TYPES = new Set<KeyType>(['legacy', 'nacl', 'secp256k1', 'cardanoByron'])

const isDerivationPath = (
  derivationPath: PathLike | DerivationPath
): derivationPath is DerivationPath => {
  if (typeof derivationPath !== 'object' || !(Symbol.toStringTag in derivationPath)) return false
  // Current DerivationPath types Symbol.toStringTag as a string getter; some older
  // versions exposed it as a method. Read it loosely so both runtime shapes are handled.
  // allow: cast — cross-version Symbol.toStringTag shape (string getter | legacy method); preserves the defensive check, emitted JS unchanged
  const tag = (derivationPath as { [Symbol.toStringTag]: unknown })[Symbol.toStringTag]
  return tag === 'DerivationPath' || (typeof tag === 'function' && tag() === 'DerivationPath')
}

export default class KeyIdentifier {
  declare readonly derivationAlgorithm: DerivationAlgorithm
  declare readonly assetName?: string
  declare readonly keyType: KeyType
  declare readonly derivationPath: string
  readonly #derivationPath: DerivationPath

  constructor(params: KeyIdentifierParams) {
    // Strip the prototype chain so destructuring below cannot fall through to
    // a polluted Object.prototype (e.g. `Object.prototype.assetName = 'evil'`
    // would otherwise leak in when the caller omits `assetName`).
    const safeParams = { __proto__: null, ...params }
    const { derivationAlgorithm, derivationPath, assetName, keyType: rawKeyType } = safeParams
    assert(typeof derivationAlgorithm === 'string', 'derivationAlgorithm not a string')
    assert(
      SUPPORTED_KDFS.has(derivationAlgorithm),
      `${derivationAlgorithm} is not a valid derivationAlgorithm`
    )

    assert(['string', 'undefined'].includes(typeof assetName), 'assetName was not a string')

    const keyType = rawKeyType || (derivationAlgorithm === 'SLIP10' ? 'nacl' : 'secp256k1')
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

  derive(pathLike: PathLike): KeyIdentifier {
    return new KeyIdentifier({
      ...this,
      derivationPath: this.#derivationPath.extend(pathLike),
    })
  }

  getPath(): DerivationPath {
    return this.#derivationPath
  }

  toString(): string {
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

  // allow: validates untrusted input by attempting construction; `unknown` is the honest param type (callers pass arbitrary values) — alt KeyIdentifierLike would lie; preserves behavior
  static validate = (potentialKeyIdentifier: unknown): boolean => {
    try {
      // eslint-disable-next-line no-new
      new KeyIdentifier(potentialKeyIdentifier as KeyIdentifierParams) // allow: constructor runtime-validates and throws on bad input; cast bridges unknown→KeyIdentifierParams — alt forces every caller to pre-cast; preserves behavior
      return true
    } catch {
      return false
    }
  }

  // allow: compares arbitrary untrusted values (callers pass null, strings, partials, instances); `unknown` is the honest param type — alt KeyIdentifierLike would lie and make the runtime guards dead code; preserves behavior
  static compare = (keyIdA: unknown, keyIdB: unknown): boolean => {
    if (
      typeof keyIdA !== 'object' ||
      typeof keyIdB !== 'object' ||
      [keyIdA, keyIdB].includes(null)
    ) {
      return false
    }

    // Both are non-null objects past the guard; the `.includes(null)` form does not narrow in TS.
    const a = keyIdA as Record<string, unknown> // allow: post-guard non-null object indexed by dynamic field name — alt: narrowing would require restructuring the guard; preserves behavior
    const b = keyIdB as Record<string, unknown> // allow: post-guard non-null object indexed by dynamic field name — alt: narrowing would require restructuring the guard; preserves behavior
    return !['derivationAlgorithm', 'derivationPath', 'assetName', 'keyType'].some(
      (fieldName) =>
        Object.prototype.hasOwnProperty.call(a, fieldName) &&
        Object.prototype.hasOwnProperty.call(b, fieldName) &&
        a[fieldName] !== b[fieldName]
    )
  }
}
