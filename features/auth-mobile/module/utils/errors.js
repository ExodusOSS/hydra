export class BiometryChangedError extends Error {
  constructor(message) {
    super(message)
    this.name = 'BiometryChanged'
  }
}

export class InvalidPasscodeLengthError extends Error {
  constructor(message) {
    super(message)
    this.name = 'InvalidPasscodeLength'
  }
}
