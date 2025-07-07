import BIPPath from 'bip32-path'
import assert from 'minimalistic-assert'
import { BIP32_PURPOSES } from './constants.js'

const HARDENED_OFFSET = 0x80_00_00_00
const PATH_INDEX_REGEX = /^(\d+)(')?$/u

/**
 * Adapted bip32-path with stricter input validation and more flexible input parsing
 */
export class DerivationPath {
  /** @type {number[]} */
  #path

  /**
   * @param {number[]} derivationPath
   * @param {{requireAllHardened: boolean}} [options]
   */
  constructor(derivationPath, { requireAllHardened = false } = {}) {
    let allHardened = true
    let hardeningStillAllowed = true

    for (const index of derivationPath) {
      assert(typeof index === 'number', 'derivation path can only contain numbers')
      const hardened = isHardened(index)

      if (!hardened) {
        allHardened = false
        hardeningStillAllowed = false
        continue
      }

      // Technically this is allowed in bip32 but defence in depth against xpub + private child key leaking xpriv
      // OK: m/0'/0
      // NOT OK: m/0/0'
      assert(
        hardeningStillAllowed,
        'derivationPath may not contain hardened index after any unhardened indexes'
      )
    }

    // SLIP10 ed25519 does not support unhardened indexes
    assert(allHardened || !requireAllHardened, 'derivationPath requires all hardened indexes')

    this.#path = derivationPath
  }

  /**
   * Creates a DerivationPath instance from a string path or array of path indices
   * @param {string | (string | number)[]} pathLike
   * @param {{requireAllHardened: boolean}} [options]
   * @returns {DerivationPath}
   */
  static from(pathLike, { requireAllHardened = false } = {}) {
    const [first, ...indices] = toArray(pathLike)

    assert(first === 'm', 'derivationPath must start with master root m')
    assert(indices.length > 0, 'derivationPath must be at least one level deep')

    return new DerivationPath(normalizeIndices(indices), { requireAllHardened })
  }

  /**
   * Returns a new derivation path extended by the given indices
   * @param {string | (string | number)[]} pathLike
   * @returns {DerivationPath}
   */
  extend(pathLike) {
    const indices = toArray(pathLike)
    assert(indices[0] !== 'm', 'Cannot extend with a partial path that starts at master ("m")')

    return new DerivationPath([...this.#path, ...normalizeIndices(indices)])
  }

  replaceAtIndex(index, value) {
    assert(
      index >= 0 && index < this.#path.length,
      `Index ${index} does not exist, consider extending the path instead of replacing`
    )

    const derivationPath = [...this.#path]
    derivationPath[index] = normalizeIndex(value)

    return new DerivationPath(derivationPath)
  }

  at(index, { unhardened = false } = {}) {
    assert(Number.isInteger(index), 'index must be an integer')
    assert(
      index >= 0 && index < this.#path.length,
      `index ${index} does not exist. Path length is ${this.#path.length}`
    )

    return unhardened ? unharden(this.#path[index]) : this.#path[index]
  }

  toString() {
    return (
      'm/' +
      this.#path
        .map((index) => {
          if (isHardened(index)) {
            return unharden(index) + "'"
          }

          return index
        })
        .join('/')
    )
  }

  toJSON() {
    return this.toString()
  }

  toPathArray() {
    return this.#path
  }

  get [Symbol.toStringTag]() {
    return 'DerivationPath'
  }
}

/**
 * @param {?} derivationPath
 * @returns {(string|number)[]}
 */
const toArray = (derivationPath) => {
  if (typeof derivationPath === 'string') {
    return derivationPath.split('/')
  }

  if (Array.isArray(derivationPath)) {
    return derivationPath
  }

  throw new TypeError(`Invalid dervation path: "${derivationPath}"`)
}

function normalizeIndex(index) {
  if (typeof index === 'number') {
    return index
  }

  const match = index.match(PATH_INDEX_REGEX)
  assert(match, "derivationPath must contain only a number and optionally a hardening character '")

  const [unhardenedIndex, hardeningChar] = match.slice(1)

  if (hardeningChar === "'") {
    return Number(unhardenedIndex) + HARDENED_OFFSET
  }

  return Number(unhardenedIndex)
}

/**
 * @param {(number|string)[]} indices
 * @returns {number[]}
 */
const normalizeIndices = (indices) => {
  const path = []
  for (const index of indices) {
    path.push(normalizeIndex(index))
  }

  return path
}

const unharden = (index) => index - HARDENED_OFFSET
const isHardened = (index) => index >= HARDENED_OFFSET

export const parseDerivationPath = (path) => {
  let [purpose, coinIndex, accountIndex, chainIndex, addressIndex] = BIPPath.fromString(
    path,
    true
  ).toPathArray()
  purpose -= HARDENED_OFFSET
  coinIndex -= HARDENED_OFFSET
  accountIndex -= HARDENED_OFFSET

  // some assets are so naughty
  if (chainIndex !== undefined && chainIndex >= HARDENED_OFFSET) chainIndex -= HARDENED_OFFSET
  if (addressIndex !== undefined && addressIndex >= HARDENED_OFFSET) addressIndex -= HARDENED_OFFSET

  return {
    purpose,
    coinIndex,
    accountIndex,
    chainIndex,
    addressIndex,
  }
}

export const assertValidDerivationPath = (path, requireAllHardened = false) => {
  assert(typeof path === 'string', 'derivationPath was not a string')
  const indexes = path.split('/')
  assert(indexes.length >= 2, 'derivationPath must be at least one level deep')
  assert(indexes[0] === 'm', 'derivationPath must start with master root m')
  const indexesWithoutM = indexes.slice(1)
  assert(
    // BIPPath does not start+end check ^$ with its regex and uses exec()
    // which allows arbitrary strings to be in the path
    // This assert avoids: "m/0'somestring" to pass
    indexesWithoutM.every((index) => typeof index === 'string' && /^\d+(')?$/u.test(index)),
    `derivationPath must contain only a number and optionally a hardening character '`
  )

  assert(
    // Technically this is allowed in bip32 but defence in depth
    // against xpub + private child key leaking xpriv
    // OK: m/0'/0
    // NOT OK: m/0/0'
    !indexesWithoutM.reduce(
      ({ hardeningStillAllowed, violatedRule }, cur) => {
        if (!hardeningStillAllowed && cur.endsWith(`'`)) {
          violatedRule = true
        }

        hardeningStillAllowed = hardeningStillAllowed && cur.endsWith(`'`)
        return { hardeningStillAllowed, violatedRule }
      },
      { hardeningStillAllowed: true, violatedRule: false }
    ).violatedRule,
    `derivationPath may not contain hardened index after any unhardened indexes`
  )

  if (requireAllHardened) {
    // SLIP10 ed25519 does not support unhardened indexes
    assert(
      indexesWithoutM.every((index) => index.endsWith(`'`)),
      `derivationPath requires all hardened indexes`
    )
  }
}

export const isValidDerivationPath = (path, requireAllHardened = false) => {
  try {
    assertValidDerivationPath(path, requireAllHardened)
    return true
  } catch {
    return false
  }
}

export const buildDerivationPath = ({
  derivationAlgorithm,
  purpose,
  bip44,
  accountIndex,
  chainIndex,
  addressIndex,
}) => {
  assert(BIP32_PURPOSES.includes(purpose), `invalid bip purpose ${purpose}`)
  assert(
    typeof accountIndex === 'number' && accountIndex >= 0,
    'accountIndex must be positive number'
  )
  const path = ['m', `${purpose}'`, `${unhardenDerivationIndex(bip44)}'`, `${accountIndex}'`]

  const usingSLIP10 = derivationAlgorithm === 'SLIP10'
  if (chainIndex !== undefined) {
    assert(typeof chainIndex === 'number', 'chainIndex must be number')
    assert(chainIndex >= 0, 'chainIndex must be positive number')
    path.push(harden(chainIndex).if(usingSLIP10))
  }

  if (addressIndex !== undefined) {
    assert(typeof addressIndex === 'number', 'addressIndex must be number')
    assert(addressIndex >= 0, 'addressIndex must be positive number')
    path.push(harden(addressIndex).if(usingSLIP10))
  }

  const fullPath = path.join('/')

  assertValidDerivationPath(fullPath)

  return fullPath
}

const harden = (index) => {
  return {
    if: (condition) => (condition ? `${index}'` : index),
  }
}

export const unhardenDerivationIndex = (hardenedIndex) => {
  return hardenedIndex - HARDENED_OFFSET
}
