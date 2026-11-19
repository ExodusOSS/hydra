import { safeString } from '@exodus/safe-string'

const IOS_AUTH_FAILURE_MESSAGES = new Map([
  ['-25293', safeString`iOS device authentication failed: authentication rejected (-25293)`],
  ['-25308', safeString`iOS device authentication failed: interaction not allowed (-25308)`],
  ['-25291', safeString`iOS device authentication failed: Keychain unavailable (-25291)`],
  ['-26275', safeString`iOS device authentication failed: Keychain decoding failed (-26275)`],
  ['-34018', safeString`iOS device authentication failed: missing entitlement (-34018)`],
  ['-50', safeString`iOS device authentication failed: invalid parameter (-50)`],
])

export class DeviceAuthenticationFailedError extends Error {
  constructor(code) {
    super(
      IOS_AUTH_FAILURE_MESSAGES.get(String(code)) ??
        safeString`iOS device authentication failed: unknown error`
    )
    this.name = safeString`DeviceAuthenticationFailed`
  }
}

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
