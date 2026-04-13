import { TrezorDevice } from './device'
import { ExodusTrezorEvents } from './exodus-trezor-events'
import type { PlatformInfoAdapter } from '@exodus/platform-info'
import type { Logger } from '@exodus/logger'
import assert from 'minimalistic-assert'

import type {
  HardwareWalletDescriptor,
  HardwareWalletDiscovery,
  TransportTypes,
  TrezorManufacturer,
} from '@exodus/hw-common'
import { DeviceUninitializedError } from '@exodus/hw-common'
import type { Atom } from '@exodus/atoms'
import type { HwTrezorConfig } from '../index'

export class TrezorDiscovery implements HardwareWalletDiscovery {
  #events?: ExodusTrezorEvents
  #pairingPromptAtom: Atom<boolean>
  #thpCredentialsAtom: Atom<any>
  #platformInfo: PlatformInfoAdapter
  #transportType: string
  #logger: Logger
  #bluetoothScannerTimeout: number
  #assetsModule: any
  #listPromise?: Promise<HardwareWalletDescriptor[]>
  #isUnlocked: boolean = false
  #cachedCredentials: any = undefined
  #pendingCredentialsUpdate: any = undefined

  constructor(
    platformInfo: PlatformInfoAdapter,
    pairingPromptAtom: Atom<boolean>,
    thpCredentialsAtom: Atom<any>,
    logger: Logger,
    config: HwTrezorConfig,
    assetsModule: any
  ) {
    this.#pairingPromptAtom = pairingPromptAtom
    this.#thpCredentialsAtom = thpCredentialsAtom
    this.#platformInfo = platformInfo
    this.#assetsModule = assetsModule
    assert(typeof config.transportType === 'string', 'config.transportType must be a string')
    this.#transportType = config.transportType
    this.#logger = logger
    assert(
      typeof config.bluetoothScannerTimeout === 'number',
      'Required config.bluetoothScannerTimeout must be a number'
    )
    this.#bluetoothScannerTimeout = config.bluetoothScannerTimeout
  }

  scan = async () => {
    if (!this.#events) {
      const platformInfo = await this.#platformInfo.get()
      this.#events = new ExodusTrezorEvents({
        appName: 'Exodus',
        hostName: `${platformInfo.device?.manufacturer} Device`,
        pairingCredentials: this.#cachedCredentials,
      })
    }

    return new Promise<void>((resolve, reject) => {
      this.#events!.on('error', reject)
      this.#events!.init({
        transport: this.#transportType,
      })
      if (['bluetooth', 'bridge'].includes(this.#transportType)) {
        setTimeout(resolve, this.#bluetoothScannerTimeout)
      }
    })
  }

  stopScan = () => {
    try {
      this.#events?.deinit()
    } catch (e) {
      this.#logger.warn(`Trezor events deinit threw error: ${e}`)
    }
  }

  list: () => Promise<HardwareWalletDescriptor[]> = async () => {
    if (this.#listPromise) {
      return this.#listPromise
    }

    this.#listPromise = this.#listInternal()

    try {
      return await this.#listPromise
    } finally {
      this.#listPromise = undefined
    }
  }

  #listInternal = async (): Promise<HardwareWalletDescriptor[]> => {
    if (!this.#events?.connected || (await this.#pairingPromptAtom.get())) {
      return []
    }

    const features = await this.#events.features()

    if (features && !features.initialized) {
      throw new DeviceUninitializedError()
    }

    if (!this.#events.device.isPaired()) {
      await this.#pairingPromptAtom.set(true)
      return []
    }

    const events = this.#events
    const assetsModule = this.#assetsModule
    const descriptor = {
      name: features.label,
      manufacturer: 'trezor' as TrezorManufacturer,
      model: features.model,
      transport: this.#transportType as TransportTypes,
      internalDescriptor: features.device_id,
      async get() {
        return new TrezorDevice(events!, this, assetsModule)
      },
    }

    return [descriptor]
  }

  get connected() {
    return this.#events?.connected ?? false
  }

  submitPairingCode = async (code: string) => {
    let result
    try {
      // Complete initial pairing with the code
      result = await this.#events?.processThpCodeEntry(code)

      // Request autoconnect credentials so future connections don't require confirmation
      try {
        const autoconnectCredential = await this.#events?.getThpCredentials(true)
        this.#logger.debug('Got autoconnect credentials:', autoconnectCredential)

        // Update result with autoconnect credential
        if (result?.knownCredentials && autoconnectCredential) {
          // Replace the last credential (the one we just created) with the autoconnect version
          result.knownCredentials[result.knownCredentials.length - 1] = autoconnectCredential
        }
      } catch (autoconnectError) {
        // Log but don't fail pairing if autoconnect request fails
        this.#logger.warn('Failed to get autoconnect credentials:', autoconnectError)
      }
    } finally {
      this.#cachedCredentials = result

      if (this.#isUnlocked) {
        await this.#thpCredentialsAtom.set(result)
      } else {
        this.#pendingCredentialsUpdate = result
      }

      await this.#pairingPromptAtom.set(false)
    }

    return result
  }

  clearPairingPrompt = async () => {
    await this.#pairingPromptAtom.set(false)
  }

  stop = async () => {
    this.stopScan()
  }

  onUnlock = async () => {
    this.#isUnlocked = true

    if (this.#pendingCredentialsUpdate) {
      await this.#thpCredentialsAtom.set(this.#pendingCredentialsUpdate)
      this.#pendingCredentialsUpdate = undefined
    } else {
      this.#cachedCredentials = await this.#thpCredentialsAtom.get()
    }
  }

  onLock = () => {
    this.#isUnlocked = false
  }
}
