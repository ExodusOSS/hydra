import KeyIdentifier from '@exodus/key-identifier'
import { fromMasterSeed as bip32FromMasterSeed } from '@exodus/bip32'
import { typedView } from '@exodus/bytes/array.js'
import { utf8fromString } from '@exodus/bytes/utf8.js'
import SLIP10 from '@exodus/slip10'
import assert from 'minimalistic-assert'
import { hash } from '@exodus/crypto/hash'
import { edwardsToPublic } from '@exodus/crypto/curve25519'
import { privateKeyToPublicKey } from '@exodus/crypto/secp256k1'

import * as ed25519 from './crypto/ed25519.js'
import * as secp256k1 from './crypto/secp256k1.js'
import * as sodium from './crypto/sodium.js'
import * as cardanoEd25519 from './crypto/cardano.js'

import {
  throwIfInvalidKeyIdentifier,
  throwIfInvalidMasters,
  throwIfInvalidLegacyPrivToPub,
} from './validate.js'
import { getSeedId, getUniqueSeedIds } from './crypto/seed-id.js'

const MAP_KDF = Object.freeze({
  BIP32: bip32FromMasterSeed,
  SLIP10: SLIP10.fromSeed,
})

const EXTERNAL_SEED_ID_PREFIX = 'ext:'

const isExternalSeedId = (seedId) => seedId.startsWith(EXTERNAL_SEED_ID_PREFIX)

export const MODULE_ID = 'keychain'

export class Keychain {
  #masters = Object.create(null)
  #legacyPrivToPub = null
  #seedLockStatus = Object.create(null)
  #getPrivateHDKeySymbol = Symbol('getPrivateHDKey')

  // TODO: remove default param. Use it temporarily for backward compatibility.
  constructor({ legacyPrivToPub = Object.create(null) }) {
    throwIfInvalidLegacyPrivToPub(legacyPrivToPub)

    // Create a safe, cloned, frozen map of what was passed to us.
    // We can not deep freeze sadly, because the values are functions and this could
    // still have side-effects where the functions are referencing variables that are still mutable
    // but at this point in time this is the best we can do.
    this.#legacyPrivToPub = Object.assign(Object.create(null), legacyPrivToPub)
    Object.freeze(this.#legacyPrivToPub)

    this.sodium = sodium.create({ getPrivateHDKey: this.#getPrivateHDKey })
    this.ed25519 = ed25519.create({ getPrivateHDKey: this.#getPrivateHDKey })
    this.secp256k1 = secp256k1.create({ getPrivateHDKey: this.#getPrivateHDKey })
    this.cardanoEd25519 = cardanoEd25519.create({ getPrivateHDKey: this.#getPrivateHDKey })
  }

  #assertPrivateKeysUnlocked(seedIds) {
    const locked = this.#checkPrivateKeysLocked(seedIds)
    assert(!locked, 'private keys are locked')
  }

  #checkPrivateKeysLocked(seedIds) {
    if (!seedIds?.length) {
      return Object.values(this.#seedLockStatus).some(Boolean)
    }

    return seedIds.some((seedId) => {
      assert(
        Object.hasOwn(this.#seedLockStatus, seedId),
        `cannot check lock state for unknown seed "${seedId}"`
      )
      return this.#seedLockStatus[seedId]
    })
  }

  async arePrivateKeysLocked(seeds = []) {
    assert(Array.isArray(seeds), 'seeds must be an array')
    const seedIds = await getUniqueSeedIds(seeds)
    return this.#checkPrivateKeysLocked(seedIds)
  }

  lockPrivateKeys() {
    const seedIds = Object.keys(this.#masters)
    this.#seedLockStatus = seedIds.reduce((acc, seedId) => {
      if (isExternalSeedId(seedId)) {
        delete this.#masters[seedId]
      } else {
        acc[seedId] = true
      }

      return acc
    }, Object.create(null))
  }

  async unlockPrivateKeys(seeds = []) {
    const seedIds = await getUniqueSeedIds(seeds)

    const existingSeedIds = Object.keys(this.#masters)
    for (const seedId of seedIds) {
      const hasSeed = existingSeedIds.includes(seedId)
      assert(hasSeed, 'must pass in existing seed')
    }

    for (const seedId of seedIds) {
      this.#seedLockStatus[seedId] = false
    }
  }

  async addSeed(seed) {
    assert(seed instanceof Uint8Array && seed.length === 64, 'seed must be Uint8Array of 64 bytes')
    if (!Buffer.isBuffer(seed)) seed = typedView(seed, 'buffer') // TODO: switch to Uint8Array

    const mastersEntries = await Promise.all(
      Object.entries(MAP_KDF).map(async ([key, fromSeed]) => [key, await fromSeed(seed)])
    )
    const masters = Object.assign(Object.create(null), Object.fromEntries(mastersEntries))
    throwIfInvalidMasters(masters)

    const seedId = await getSeedId(seed)
    this.#masters[seedId] = masters
    // manually unlock here since unlockPrivateKeys requires seed to already exist
    this.#seedLockStatus[seedId] = false
    return seedId
  }

  removeAllSeeds() {
    this.#masters = Object.create(null)
    this.#seedLockStatus = Object.create(null)
  }

  async removeSeeds(seeds = []) {
    const seedIds = await getUniqueSeedIds(seeds)
    const existingSeedIds = new Set([
      ...Object.keys(this.#masters),
      ...Object.keys(this.#seedLockStatus),
    ])
    const seedIdsToRemove = seedIds.filter((seedId) => existingSeedIds.has(seedId))

    for (const id of seedIdsToRemove) {
      delete this.#masters[id]
      delete this.#seedLockStatus[id]
    }

    return seedIdsToRemove
  }

  removeExternalPrivateKey = (seedId) => {
    if (!this.#masters[seedId]) return

    assert(isExternalSeedId(seedId), `removeExternalPrivateKey: prevent removing seed ${seedId}`)

    delete this.#masters[seedId]
    delete this.#seedLockStatus[seedId]
  }

  addExternalPrivateKey = async ({ privateKey, keyId }) => {
    assert(
      privateKey instanceof Uint8Array,
      `addExternalPrivateKey: expected type of "privateKey" to be Uint8Array`
    )
    assert(
      privateKey.length === 32,
      `addExternalPrivateKey: expected "privateKey" to be exactly 32 bytes long`
    )
    throwIfInvalidKeyIdentifier(keyId)

    let publicKey

    if (keyId.derivationAlgorithm === 'SLIP10' && keyId.keyType === 'nacl') {
      publicKey = await edwardsToPublic({ privateKey, format: 'buffer' })
    }

    if (keyId.derivationAlgorithm === 'BIP32' && keyId.keyType === 'secp256k1') {
      publicKey = await privateKeyToPublicKey({ privateKey, format: 'buffer' })
    }

    const seedId = await this.#createExternalSeedId({ privateKey, publicKey, keyId })
    const master = {
      __proto__: null,
      privateKey,
      keyId,
      derive: (path) => {
        assert(
          path === keyId.derivationPath,
          'derive: unable to derive path specified in key identifier for external private key'
        )
        // For now we only return the supplied privateKey, but we may want to support privateKeys
        // for a derivationPath prefix and do actual derivation here for expanded derivationPaths.
        return { privateKey, publicKey, toJSON: () => ({ xpriv: null, xpub: null }) }
      },
    }

    this.#masters[seedId] = Object.defineProperties(Object.create(null), {
      [keyId.derivationAlgorithm]: {
        enumerable: true,
        configurable: false,
        writable: false,
        value: master,
      },
    })

    this.#seedLockStatus[seedId] = false
    return seedId
  }

  #createExternalSeedId = async ({ privateKey, publicKey, keyId }) => {
    if (!publicKey) {
      const hdkey = { privateKey }
      publicKey = await this.#getPublicKeyFromHDKey({ hdkey, keyId })
    }

    if (!publicKey) throw new Error(`#createExternalSeedId: failed to derive public key`)

    const { keyType, derivationAlgorithm, derivationPath } = keyId
    const data = [
      utf8fromString(JSON.stringify({ keyType, derivationAlgorithm, derivationPath }), 'buffer'),
      publicKey,
    ]

    return `${EXTERNAL_SEED_ID_PREFIX}${await hash('hash160', data, 'hex')}`
  }

  #getPrivateHDKey = ({ seedId, keyId, getPrivateHDKeySymbol }) => {
    if (getPrivateHDKeySymbol !== this.#getPrivateHDKeySymbol) {
      this.#assertPrivateKeysUnlocked(seedId ? [seedId] : undefined)
    }

    throwIfInvalidKeyIdentifier(keyId)
    assert(typeof seedId === 'string', 'seedId must be a BIP32 key identifier in hex encoding')
    assert(this.#masters[seedId], `seed with id "${seedId}" is not initialized`)

    throwIfInvalidMasters(this.#masters[seedId])

    const { derivationAlgorithm, derivationPath, keyType } = keyId
    const master = this.#masters[seedId][derivationAlgorithm]

    if (isExternalSeedId(seedId)) {
      assert(master, '#getPrivateHDKey: found no valid master seed')
      assert(
        keyType === master.keyId.keyType,
        '#getPrivateHDKey: received invalid keyType for specified master seed'
      )
    }

    return master.derive(derivationPath)
  }

  #getPublicKeyFromHDKey = async ({ hdkey, keyId }) => {
    if (keyId.keyType === 'legacy') {
      if (Object.hasOwn(this.#legacyPrivToPub, keyId.assetName)) {
        return this.#legacyPrivToPub[keyId.assetName](hdkey.privateKey)
      }

      throw new Error(`asset name ${keyId.assetName} has no legacyPrivToPub mapper`)
    }

    if (keyId.derivationAlgorithm === 'BIP32' && keyId.keyType === 'nacl') {
      return sodium.privToPub(hdkey.privateKey)
    }

    if (keyId.keyType === 'cardanoByron') {
      const { publicKey } = await cardanoEd25519.getCardanoV1ExtendedPublicKey(hdkey.privateKey)
      return publicKey
    }

    // SLIP10 already produces the correct public key for curve ed25119
    // BIP32 already produces the correct public key for secp256k1 keyType
    return hdkey.publicKey
  }

  async exportKey({ seedId, keyId, exportPrivate, exportPublic = true }) {
    assert(typeof seedId === 'string', 'seedId must be a string')

    if (exportPrivate) {
      this.#assertPrivateKeysUnlocked([seedId])
    }

    keyId = new KeyIdentifier(keyId)

    const hdkey = this.#getPrivateHDKey({
      seedId,
      keyId,
      getPrivateHDKeySymbol: this.#getPrivateHDKeySymbol,
    })
    const privateKey = hdkey.privateKey
    let publicKey = null

    if (exportPublic) {
      publicKey = await this.#getPublicKeyFromHDKey({ hdkey, keyId })
    }

    const { xpriv, xpub } = hdkey.toJSON()
    return {
      xpub: exportPublic ? xpub : null,
      xpriv: exportPrivate ? xpriv : null,
      publicKey,
      privateKey: exportPrivate ? privateKey : null,
    }
  }

  async getPublicKey({ seedId, keyId }) {
    const hdkey = this.#getPrivateHDKey({
      seedId,
      keyId: new KeyIdentifier(keyId),
      getPrivateHDKeySymbol: this.#getPrivateHDKeySymbol,
    })

    return this.#getPublicKeyFromHDKey({ hdkey, keyId })
  }

  async signBuffer({ seedId, keyId, data, signatureType, enc, tweak, extraEntropy, ...rest }) {
    const noTweak = tweak === undefined
    const noEnc = enc === undefined
    const noOpts = noEnc && noTweak && extraEntropy === undefined
    const invalidOptions = Object.keys(rest).filter((key) => key !== 'ecOptions') // ignore legacy option `ecOptions`

    assert(invalidOptions.length === 0, `unsupported options supplied to signBuffer()`)
    assert(data instanceof Uint8Array, `expected "data" to be a Uint8Array, got: ${typeof data}`)
    assert(
      (['ecdsa', 'schnorr', 'schnorrZ'].includes(signatureType) && keyId.keyType === 'secp256k1') ||
        (signatureType === 'ed25519' && ['nacl', 'cardanoByron'].includes(keyId.keyType)),
      `"keyId.keyType" ${keyId.keyType} does not support "signatureType" ${signatureType}`
    )

    if (signatureType === 'ed25519') {
      assert(noOpts, 'unsupported options supplied for ed25519 signature')

      if (keyId.keyType === 'cardanoByron') {
        return this.cardanoEd25519.signBuffer({ seedId, keyId, data })
      }

      return this.ed25519.signBuffer({ seedId, keyId, data })
    }

    if (signatureType === 'schnorrZ') {
      assert(noOpts, 'unsupported options supplied for schnorrZ signature')
      return this.secp256k1.signSchnorrZ({ seedId, keyId, data })
    }

    // only accept 32 byte buffers for ecdsa
    assert(data.length === 32, `expected "data" to have 32 bytes, got: ${data.length}`)

    if (signatureType === 'schnorr') {
      assert(noEnc, 'unsupported options supplied for schnorr signature')
      return this.secp256k1.signSchnorr({ seedId, keyId, data, tweak, extraEntropy })
    }

    // signatureType === 'ecdsa'
    assert(noTweak, 'unsupported options supplied for ecdsa signature')
    return this.secp256k1.signBuffer({ seedId, keyId, data, enc, extraEntropy })
  }
}

const createKeychain = (args = Object.create(null)) => new Keychain({ ...args })

const keychainDefinition = {
  id: MODULE_ID,
  type: 'module',
  public: true,
  factory: createKeychain,
  dependencies: ['legacyPrivToPub?'],
}

export default keychainDefinition
