import semver from 'semver'
import {
  AssetUnsupportedError,
  DeviceLockedError,
  DeviceConnectionError,
  UserRefusedError,
} from '@exodus/hw-common'

import {
  applicationNameToBaseAssetNames,
  assetApplications,
  supportedBaseAssetNames,
} from './assets'
import { createApplicationManager as applicationFactory } from './management/application'
import { UnsupportedVersionError, ApplicationNotFoundError } from './errors'

import type {
  GetAddressParams,
  GetPublicKeyParams,
  GetXPubParams,
  HardwareWalletDescriptor,
  HardwareWalletDevice,
  SignMessageParams,
  SignTransactionParams,
} from '@exodus/hw-common'
import type Transport from '@ledgerhq/hw-transport'

import type { GetInformationResponse } from './management/application'
import type { TransportFactory } from './types'
import type { Atom } from '@exodus/atoms'

export type Dependencies = {
  transportFactory: TransportFactory
  descriptor: HardwareWalletDescriptor
  walletPolicyAtom: Atom<Record<string, Buffer>>
}

export class LedgerDevice implements HardwareWalletDevice {
  #transportFactory: TransportFactory
  #descriptor: HardwareWalletDescriptor
  #walletPolicyAtom: Atom<Record<string, Buffer>>
  #cancelPendingAction?: () => Promise<void>

  constructor({ transportFactory, descriptor, walletPolicyAtom }: Dependencies) {
    this.#transportFactory = transportFactory
    this.#descriptor = descriptor
    this.#walletPolicyAtom = walletPolicyAtom
  }

  get descriptor() {
    return this.#descriptor
  }

  #runInSession = async <Return>(
    operation: (args: Transport) => Promise<Return>,
    expectErrorWhenClosing = false
  ) => {
    const transport = await this.#transportFactory.open(this.#descriptor.internalDescriptor)
    this.#cancelPendingAction = async () => transport.close()
    try {
      return await operation(transport)
    } catch (err) {
      throw transformToCommonError(err)
    } finally {
      this.#cancelPendingAction = undefined
      if (expectErrorWhenClosing) {
        await transport.close().catch((err) => {
          console.warn(`caught error while closing ledger transport but was expected = `, err)
        })
      } else {
        await transport.close()
      }
    }
  }

  #getAssetApplication = (assetName: string) => {
    const handlerFactory = assetApplications[assetName]
    if (!handlerFactory) throw new AssetUnsupportedError(assetName)
    return handlerFactory
  }

  #listApplications = async () => {
    return this.#runInSession(async (transport) => {
      const handler = await applicationFactory(transport)
      return handler.listApplications()
    })
  }

  #getInformation = async () => {
    return this.#runInSession(async (transport) => {
      const handler = await applicationFactory(transport)
      return handler.getInformation()
    })
  }

  #openApplication = async (applicationName: string) => {
    return this.#runInSession(async (transport) => {
      const handler = await applicationFactory(transport)
      return handler.openApplication(applicationName)
    }, true)
  }

  #quitApplication = async () => {
    return this.#runInSession(async (transport) => {
      const handler = await applicationFactory(transport)
      return handler.quitApplication()
    })
  }

  cancelAction = async () => {
    if (this.#cancelPendingAction) {
      // Close the existing transport so we can open a new one
      await this.#cancelPendingAction()
      // The only way to clear the approval flow ui on the device is to quit the application
      await this.#quitApplication()
    }
  }

  ensureApplicationIsOpened = async (baseAssetName: string) => {
    const { applications } = this.#getAssetApplication(baseAssetName)
    const supportedApplicationNames = applications.map(({ applicationName }) => applicationName)

    // Get the application information of currently opened application
    const currentApplicationInfo = await this.#getInformation()
    let desiredApplicationInfo: GetInformationResponse

    if (supportedApplicationNames.includes(currentApplicationInfo.name)) {
      // The currently opened application is one of the desired one
      desiredApplicationInfo = currentApplicationInfo
    } else {
      // Quit current & open one the desired one, will throw if not installed
      await this.#quitApplication()
      let applicationName = null
      for (const applicationNameToOpen of supportedApplicationNames) {
        // Attempt opening any of the applications, catch error when not available.
        try {
          await this.#openApplication(applicationNameToOpen)
          applicationName = applicationNameToOpen
          break
        } catch (err) {
          const APPLICATION_NOT_INSTALLED = 0x68_07
          if ((err as any).statusCode === APPLICATION_NOT_INSTALLED) {
            continue
          }
        }
      }

      if (!applicationName) {
        throw new ApplicationNotFoundError(supportedApplicationNames)
      }

      desiredApplicationInfo = await this.#getInformation()
    }

    // We have a supported application open, ensure it meets the supported version requirements
    const { supportedVersions } = applications.find(
      ({ applicationName }) => applicationName === desiredApplicationInfo.name
    )!
    const isSupportedVersion = semver.satisfies(desiredApplicationInfo.version, supportedVersions)
    if (!isSupportedVersion) {
      throw new UnsupportedVersionError(
        baseAssetName,
        desiredApplicationInfo.name,
        desiredApplicationInfo.version,
        supportedVersions
      )
    }
  }

  listSupportedAssetNames = async () => {
    return supportedBaseAssetNames
  }

  listInstalledAssetNames = async (): Promise<string[]> => {
    // We need to quit the current application if it's not
    // on the dashboard, because listing the applications
    // can not be done while inside an asset application.
    const { name: applicationName } = await this.#getInformation()
    if (applicationName !== 'BOLOS') await this.#quitApplication()

    // Get the application information of currently opened application
    const installedApplications = await this.#listApplications()

    const installedAssets: string[] = []
    installedApplications.forEach(({ name: applicationName }) => {
      const assetNames = applicationNameToBaseAssetNames[applicationName]
      if (assetNames) installedAssets.push(...assetNames)
    })

    return installedAssets
  }

  listUseableAssetNames = async (): Promise<string[]> => {
    // Get the application information of currently opened application
    const { name: applicationName } = await this.#getInformation()
    const assetNames = applicationNameToBaseAssetNames[applicationName]
    return assetNames || []
  }

  getAddress = async (params: GetAddressParams) => {
    await this.ensureApplicationIsOpened(params.assetName)
    return this.#runInSession(async (transport) => {
      const handler = await this.#getAssetApplication(params.assetName).handler(
        transport,
        this.#walletPolicyAtom
      )
      return handler.getAddress(params)
    })
  }

  getXPub = async (params: GetXPubParams) => {
    await this.ensureApplicationIsOpened(params.assetName)
    return this.#runInSession(async (transport) => {
      const handler = await this.#getAssetApplication(params.assetName).handler(transport)
      return handler.getXPub(params)
    })
  }

  getPublicKey = async (params: GetPublicKeyParams) => {
    await this.ensureApplicationIsOpened(params.assetName)
    return this.#runInSession(async (transport) => {
      const handler = await this.#getAssetApplication(params.assetName).handler(transport)
      return handler.getPublicKey(params)
    })
  }

  signTransaction = async (params: SignTransactionParams) => {
    await this.ensureApplicationIsOpened(params.assetName)
    return this.#runInSession(async (transport) => {
      const handler = await this.#getAssetApplication(params.assetName).handler(
        transport,
        this.#walletPolicyAtom
      )
      return handler.signTransaction(params)
    })
  }

  signMessage = async (params: SignMessageParams) => {
    await this.ensureApplicationIsOpened(params.assetName)
    return this.#runInSession(async (transport) => {
      const handler = await this.#getAssetApplication(params.assetName).handler(transport)
      return handler.signMessage(params)
    })
  }
}

function transformToCommonError(_err: unknown) {
  const err = <Error & { name?: string; statusCode?: number }>_err
  if (err.name === 'LockedDeviceError') {
    // Enter PIN code
    return new DeviceLockedError()
  }

  if (err.name === 'UserRefusedOnDevice' || err.statusCode === 0x69_85) {
    // Solana & Ethereum firmware re-uses the 0x6985 error code for "User refused"
    // and various other transaction related errors but for sanity
    // we will assume that the user refused the transaction.
    return new UserRefusedError(true)
  }

  if (
    [
      'HwTransportError',
      'TransportError',
      'TransportRaceCondition',
      'UnresponsiveDeviceError',
      'DisconnectedDevice',
      'DisconnectedDeviceDuringOperation',
    ].includes(err.name)
  ) {
    // Transport errors
    return new DeviceConnectionError(err)
  }

  return err
}
