export abstract class HardwareWalletError extends Error {
  abstract name: string
}

export class NoDeviceFoundError extends HardwareWalletError {
  name = 'NoDeviceFoundError'
  constructor() {
    super(`unable to find a connected device`)
  }
}

export class DeviceConnectionError extends HardwareWalletError {
  name = 'DeviceConnectionError'
  constructor(cause: Error) {
    super('Connection hangup with device', { cause })
  }
}

export class DeviceLockedError extends HardwareWalletError {
  name = 'DeviceLockedError'
  constructor() {
    super('Device requires unlocking')
  }
}

export class AssetUnsupportedError extends HardwareWalletError {
  name = 'AssetUnsupportedError'
  assetName: string
  constructor(assetName: string) {
    super('The asset is not supported on this device')
    this.assetName = assetName
  }
}

export class XPubUnsupportedError extends HardwareWalletError {
  name = 'XPubUnsupportedError'
  constructor() {
    super('Getting XPub is unsupported')
  }
}

export class UserRefusedError extends HardwareWalletError {
  name = 'UserRefusedError'
  onDevice: boolean
  constructor(onDevice: boolean) {
    super('User refused the action on the device')
    this.onDevice = onDevice
  }
}
