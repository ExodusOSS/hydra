export type XPUB = string

const validateSerialized = (serialized: unknown): serialized is XPUB => {
  return typeof serialized === 'string' && serialized.startsWith('xpub')
}

const serialize = (xpub: XPUB) => xpub
const deserialize = (xpub: XPUB) => xpub

const defaultExport = {
  validateSerialized,
  serialize,
  deserialize,
}

export default defaultExport
