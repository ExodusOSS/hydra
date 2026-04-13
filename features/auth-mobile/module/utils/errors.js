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

export class DeviceAuthenticationUnavailableError extends Error {
  constructor(message = 'Device passcode or biometrics should be enabled.') {
    super(message)
    this.name = 'DeviceAuthenticationUnavailable'
  }
}
