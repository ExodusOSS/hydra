export class UnableToSerializePublicKeyError extends Error {
  name = 'UnableToSerializePublicKeyError'
  constructor() {
    super('unable to serialize public key')
  }
}

export class UnableToDeserializePublicKeyError extends Error {
  name = 'UnableToDeserializePublicKeyError'
  constructor() {
    super('unable to deserialize public key')
  }
}
