import assert from 'minimalistic-assert'

import type { Hex } from './types.js'

export type PublicKey = Hex
export type PublicKeyBuffer = Buffer

const validateSerialized = (serialized: unknown): serialized is PublicKey => {
  return typeof serialized === 'string'
}

const serialize = (deserialized: PublicKeyBuffer): PublicKey => {
  assert(Buffer.isBuffer(deserialized), `publicKey was not a Buffer`)
  return deserialized.toString('hex')
}

const deserialize = (serialized: PublicKey): PublicKeyBuffer => {
  assert(serialized, `publicKey was not a string`)
  return Buffer.from(serialized, 'hex')
}

const defaultExport = {
  validateSerialized,
  serialize,
  deserialize,
}

export default defaultExport
