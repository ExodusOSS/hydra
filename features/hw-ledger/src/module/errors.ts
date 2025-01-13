import { HardwareWalletError } from '@exodus/hw-common'

export class UnknownTransportError extends HardwareWalletError {
  name = 'UnknownTransportError'
  constructor(transportName?: string) {
    super(`unknown transport type ${transportName || ''}`)
  }
}

/**
 * Application
 */
export class ApplicationNotFoundError extends HardwareWalletError {
  name = 'ApplicationNotFoundError'
  supportedApplications: string[]
  constructor(supportedApplications: string[]) {
    super(
      `required application not installed, please install a supported application (${supportedApplications.join(
        ', '
      )}).`
    )
    this.supportedApplications = supportedApplications
  }
}

export class UnsupportedVersionError extends HardwareWalletError {
  name = 'UnsupportedVersionError'
  baseAssetName: string
  applicationName: string
  supportedVersions: string
  actualVersion: string
  constructor(
    baseAssetName: string,
    applicationName: string,
    actualVersion: string,
    supportedVersions: string
  ) {
    super(
      `version does not meet version requirements: ${actualVersion} does not match ${supportedVersions}`
    )
    this.baseAssetName = baseAssetName
    this.applicationName = applicationName
    this.supportedVersions = supportedVersions
    this.actualVersion = actualVersion
  }
}

/**
 * Signing
 */
export class RequiresBlindSigningError extends HardwareWalletError {
  name = 'RequiresBlindSigningError'
  constructor() {
    super('signing operation requires that blind signing is enabled on the device')
  }
}
