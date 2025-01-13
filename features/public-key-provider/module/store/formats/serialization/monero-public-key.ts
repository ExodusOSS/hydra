import assert from 'minimalistic-assert'

import type { Hex } from './types.js'

export type MoneroPublicKey = {
  spendPub: Hex
  viewPub: Hex
  viewPriv: Hex
}

export type MoneroPublicKeyBuffer = {
  spendPub: Buffer
  viewPub: Buffer
  viewPriv: Buffer
}

const validateSerialized = (serialized: unknown): serialized is MoneroPublicKey => {
  return (
    typeof serialized === 'object' &&
    serialized !== null &&
    typeof (<MoneroPublicKey>serialized).spendPub === 'string' &&
    typeof (<MoneroPublicKey>serialized).viewPriv === 'string' &&
    typeof (<MoneroPublicKey>serialized).viewPub === 'string'
  )
}

const serialize = (deserialized: MoneroPublicKeyBuffer): MoneroPublicKey => {
  assert(
    typeof deserialized === 'object',
    `expected deserialized monero public key to be an object`
  )
  assert(Buffer.isBuffer(deserialized.spendPub), `spendPub was not a Buffer`)
  assert(Buffer.isBuffer(deserialized.viewPriv), `viewPriv was not a Buffer`)
  assert(Buffer.isBuffer(deserialized.viewPub), `viewPub was not a Buffer`)
  return {
    spendPub: deserialized.spendPub.toString('hex'),
    viewPriv: deserialized.viewPriv.toString('hex'),
    viewPub: deserialized.viewPub.toString('hex'),
  }
}

const deserialize = (serialized: MoneroPublicKey) => {
  assert(typeof serialized === 'object', `expected serialized monero public key to be an object`)

  const spendPub = Buffer.from(serialized.spendPub, 'hex')
  const viewPriv = Buffer.from(serialized.viewPriv, 'hex')
  const viewPub = Buffer.from(serialized.viewPub, 'hex')

  assert(serialized.spendPub.length === 2 * spendPub.length, `expected spendPub to be a hex string`)
  assert(serialized.viewPriv.length === 2 * viewPriv.length, `expected viewPriv to be a hex string`)
  assert(serialized.viewPub.length === 2 * viewPub.length, `expected viewPub to be a hex string`)

  return {
    spendPub,
    viewPriv,
    viewPub,
  }
}

const defaultExport = {
  validateSerialized,
  serialize,
  deserialize,
}

export default defaultExport
