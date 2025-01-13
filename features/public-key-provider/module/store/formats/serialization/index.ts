import { UnableToDeserializePublicKeyError, UnableToSerializePublicKeyError } from '../../errors.js'
import moneroKeys from './monero-public-key.js'
import publicKeys from './public-key.js'
import xpub from './xpub.js'

import type { MoneroPublicKey, MoneroPublicKeyBuffer } from './monero-public-key.js'
import type { PublicKey, PublicKeyBuffer } from './public-key.js'

const validateSerialized = (
  publicKey: unknown
): publicKey is PublicKeyBuffer | MoneroPublicKeyBuffer => {
  return publicKeys.validateSerialized(publicKey) || moneroKeys.validateSerialized(publicKey)
}

const serialize = (
  publicKey: PublicKeyBuffer | MoneroPublicKeyBuffer
): PublicKey | MoneroPublicKey => {
  if (Buffer.isBuffer(publicKey)) {
    return publicKeys.serialize(publicKey)
  }

  if (typeof publicKey === 'object') {
    return moneroKeys.serialize(publicKey)
  }

  throw new UnableToSerializePublicKeyError()
}

const deserialize = (
  publicKey: PublicKey | MoneroPublicKey
): PublicKeyBuffer | MoneroPublicKeyBuffer => {
  if (publicKeys.validateSerialized(publicKey)) {
    return publicKeys.deserialize(publicKey)
  }

  if (moneroKeys.validateSerialized(publicKey)) {
    return moneroKeys.deserialize(publicKey)
  }

  throw new UnableToDeserializePublicKeyError()
}

export { type MoneroPublicKey, type MoneroPublicKeyBuffer } from './monero-public-key.js'
export { type PublicKey, type PublicKeyBuffer } from './public-key.js'
export { type XPUB } from './xpub.js'

const serialization = { publicKey: { validateSerialized, serialize, deserialize }, xpub }
export { serialization as default }
