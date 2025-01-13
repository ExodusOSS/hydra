import assert from 'minimalistic-assert'
import KeyIdentifier from '@exodus/key-identifier'
import serialization from '../serialization/index.js'

import type {
  WalletAccountName,
  AddParams,
  DeleteParams,
  GetParams,
  GetReturn,
  IStorageFormatBuilder,
} from './types.js'
import type { MoneroPublicKey, PublicKey, XPUB } from '../serialization/index.js'

export type StorageFormatLegacy = Record<
  WalletAccountName,
  Record<DerivationPath, PublicKeyWithMetaData>
>
type DerivationPath = string
type PublicKeyWithMetaData = {
  publicKey?: PublicKey | MoneroPublicKey
  xpub?: XPUB
  // Deprecrate usage
  chain: number[]
}

type Dependencies = {
  data?: StorageFormatLegacy
}

// Prevent mutating the original data
const clone = (data: StorageFormatLegacy) => JSON.parse(JSON.stringify(data))
export class StorageFormatLegacyBuilder implements IStorageFormatBuilder {
  #data: StorageFormatLegacy = Object.create(null)

  constructor({ data }: Dependencies = {}) {
    if (data) {
      assertStorageFormatLegacy(data)
      this.#data = clone(data)
    }
  }

  list = () => {
    return Object.keys(this.#data)
  }

  add = ({ walletAccountName, keyIdentifier, publicKey, xpub }: AddParams) => {
    assert(typeof walletAccountName === 'string', 'walletAccountName must be string')
    keyIdentifier = new KeyIdentifier(keyIdentifier)
    assert(publicKey || xpub, 'publicKey or xpub must be defined')

    const publicKeys = this.#data[walletAccountName] || Object.create(null)

    publicKeys[keyIdentifier.derivationPath] = {
      ...(publicKey ? { publicKey } : {}),
      ...(xpub ? { xpub } : {}),
      chain: [0, 0, 0],
    }

    this.#data[walletAccountName] = publicKeys
  }

  #findPublicKeyEntry = ({ walletAccountName, keyIdentifier }: GetParams) => {
    return this.#data[walletAccountName]?.[keyIdentifier.derivationPath] || null
  }

  get = ({ walletAccountName, keyIdentifier }: GetParams): GetReturn => {
    assert(typeof walletAccountName === 'string', 'walletAccountName must be string')
    const found = this.#findPublicKeyEntry({ walletAccountName, keyIdentifier })
    if (found) {
      if (!found.xpub && !found.publicKey) {
        throw new Error('publicKey entry has neither publicKey nor xpub')
      }

      return found
    }

    return null
  }

  delete = ({ walletAccountName }: DeleteParams) => {
    assert(typeof walletAccountName === 'string', 'walletAccountName must be string')
    delete this.#data[walletAccountName]
  }

  static validate(deserializedData: StorageFormatLegacy) {
    try {
      assertStorageFormatLegacy(deserializedData)
      return true
    } catch {
      return false
    }
  }

  static deserialize(data: StorageFormatLegacy) {
    return new StorageFormatLegacyBuilder({ data })
  }

  serialize = () => {
    assertStorageFormatLegacy(this.#data)
    return clone(this.#data)
  }
}

/**
 * assertStorageFormatLegacy checks whether an object complies with the legacy storage format at runtime.
 * It performs a variety of type checks to help prevent any erroneous data from being written to the store.
 * Throws an assertion error whenever an object does not comply.
 * @param deserializedData the deserialized object format
 */
export function assertStorageFormatLegacy(deserializedData: StorageFormatLegacy) {
  assert(typeof deserializedData === 'object', 'deserializedData is not an object')
  Object.entries(deserializedData).forEach(([walletAccountName, derivationPathPublicKeysMap]) => {
    assert(
      typeof walletAccountName === 'string',
      'walletAccountNames in deserializedData must be string'
    )
    assert(
      typeof derivationPathPublicKeysMap === 'object',
      'assetNamePublicKeysMap in deserializedData must be object'
    )

    Object.entries(derivationPathPublicKeysMap).forEach(
      ([derivationPath, publicKeyWithMetadata]) => {
        assert(
          typeof derivationPath === 'string',
          'derivationPath in deserializedData must be string'
        )
        assert(
          typeof publicKeyWithMetadata === 'object',
          'publicKeysWithMetadata in deserializedData must be an object'
        )

        const { publicKey, xpub } = publicKeyWithMetadata
        assert(
          Boolean(publicKey) || Boolean(xpub),
          'publicKeyWithMetadata should have either public key or xpub'
        )
        if (publicKey)
          assert(
            serialization.publicKey.validateSerialized(publicKey),
            'publicKey was not deserializable'
          )
        if (xpub) assert(serialization.xpub.validateSerialized(xpub), 'xpub was not deserializable')
      }
    )
  })
}
