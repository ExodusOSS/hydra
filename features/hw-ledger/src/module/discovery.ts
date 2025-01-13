/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { getInfosForServiceUuid, identifyUSBProductId } from '@exodus/ledgerhq-devices'

import type { Logger } from '../shared/types'
import { APDU_PORT } from './constants'
import { LedgerDevice } from './device'
import { UnknownTransportError } from './errors'

import type { Atom } from '@exodus/atoms'
import type {
  HardwareWalletDescriptor,
  HardwareWalletDiscovery,
  LedgerDescriptorWebUSB,
  LedgerDescriptorBLE,
  LedgerDescriptorTCP,
} from '@exodus/hw-common'
import type { HwLedgerConfig, TransportFactories } from './types'
import type { Subscription } from '@ledgerhq/hw-transport'
import type { BluetoothStatus } from '../atoms'

const MODULE_ID = 'ledgerDiscovery'

export type Dependencies = {
  config: HwLedgerConfig
  logger: Logger
  transportsFactories: TransportFactories
  bluetoothStatusAtom: Atom<BluetoothStatus>
  bluetoothScanningAtom: Atom<boolean>
  walletPolicyAtom: Atom<Record<string, Buffer>>
}

type MacAddress = string

export class LedgerDiscovery implements HardwareWalletDiscovery {
  #logger
  #transportsFactories: TransportFactories
  #scannerTimeout: number // ms
  #statusBluetooth: Subscription | undefined
  #bluetoothStatusAtom: Atom<BluetoothStatus>
  #scannerBluetooth: Subscription | undefined
  #bluetoothScanningAtom: Atom<boolean>
  #walletPolicyAtom: Atom<Record<string, Buffer>>
  #discoveredBluetoothDevices: Record<MacAddress, LedgerDescriptorBLE> = Object.create(null)

  constructor({
    config,
    logger,
    transportsFactories,
    bluetoothStatusAtom,
    bluetoothScanningAtom,
    walletPolicyAtom,
  }: Dependencies) {
    this.#logger = logger
    this.#bluetoothStatusAtom = bluetoothStatusAtom
    this.#bluetoothScanningAtom = bluetoothScanningAtom
    this.#walletPolicyAtom = walletPolicyAtom
    if (
      !(
        typeof transportsFactories === 'object' &&
        Object.keys(transportsFactories).length > 0 &&
        Object.entries(transportsFactories).every(
          ([transportName, transportFactory]) =>
            ['usb', 'bluetooth', 'tcp'].includes(transportName) &&
            transportFactory !== undefined &&
            typeof transportFactory.list === 'function' &&
            typeof transportFactory.open === 'function'
        )
      )
    )
      throw new UnknownTransportError()

    if (!Number.isInteger(config.bluetoothScannerTimeout)) {
      throw new TypeError(`Invalid bluetoothScannerTimeout passed through config`)
    }

    this.#transportsFactories = transportsFactories
    this.#scannerTimeout = config.bluetoothScannerTimeout
  }

  start = () => {
    if (!this.#transportsFactories.bluetooth) return
    if (this.#statusBluetooth) return

    if (this.#transportsFactories.bluetooth.observeState) {
      // TODO: change API's to match
      this.#statusBluetooth = this.#transportsFactories.bluetooth.observeState({
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        next: ({ type, available }) => this.#bluetoothStatusAtom.set({ type, available }),
        error: (error: Error) => this.#logger.error(error),
      })
    } else if (this.#transportsFactories.bluetooth.observeAvailability) {
      this.#statusBluetooth = this.#transportsFactories.bluetooth.observeAvailability({
        next: (available) => this.#bluetoothStatusAtom.set({ type: 'Unknown', available }),
        error: (error: Error) => this.#logger.error(error),
      })
    }
  }

  scan = async () => {
    this.start()
    return new Promise<void>((resolve, reject) => {
      if (this.#transportsFactories.bluetooth) {
        this.stopScan(true)

        this.#scannerBluetooth = this.#transportsFactories.bluetooth.listen({
          next: (evnt) => {
            if (evnt.type === 'add') {
              const descriptor = evnt.descriptor
              this.#discoveredBluetoothDevices[descriptor.id] = descriptor
            }
          },
          error: (error: unknown) => {
            this.#logger.error(
              `an error occured while scanning for bluetooth devices "${(error as Error).message}"`
            )
            // Ledger docs don't mention this but we should unsubcribe when an error occurs
            // to clean up the internal implementation of MultiPlatformBleAdapter
            // https://github.com/dotintent/MultiPlatformBleAdapter/blob/3601846076c7749e9419ea93cf20f3357e7d5617/android/library/src/main/java/com/polidea/multiplatformbleadapter/BleModule.java#L1176-L1185
            this.stopScan()
            reject(error)
          },

          complete: () => {}, // noop never called
        })

        // Indicate to the UI that we are in fact scanning.
        this.#bluetoothScanningAtom.set(true)

        setTimeout(() => {
          // Stop the scanner after timeout to ensure we don't endlessly scan
          // and consume too much energy or interfere with ongoing communications.
          this.stopScan()
          resolve()
        }, this.#scannerTimeout)
      } else {
        this.#logger.error(`Attempted to perform scan without having bluetooth transport factory`)
        reject(new Error(`Attempted to perform scan without having bluetooth transport factory`))
      }
    })
  }

  stopScan = (clearDevices = false) => {
    if (clearDevices) {
      // Clear all the discovered devices to ensure don't hold a handle
      // to devices that may not be available anymore.
      this.#discoveredBluetoothDevices = Object.create(null)
    }

    if (this.#scannerBluetooth) {
      // Stops the bluetooth scanner
      this.#bluetoothScanningAtom.set(false)
      this.#scannerBluetooth.unsubscribe()
      this.#scannerBluetooth = undefined
    }
  }

  list = async () => {
    const descriptors: HardwareWalletDescriptor[] = []
    for (const [transportName, transportFactory] of Object.entries(this.#transportsFactories)) {
      switch (transportName) {
        case 'usb':
          const deviceList = (await transportFactory.list()) as LedgerDescriptorWebUSB[]
          const usbDeviceList: HardwareWalletDescriptor[] = deviceList.map((hidDevice) => {
            const deviceModel = identifyUSBProductId(hidDevice.productId)
            const descriptor: HardwareWalletDescriptor = {
              name: deviceModel?.productName ?? 'Ledger USB',
              manufacturer: 'ledger',
              transport: 'usb',
              model: deviceModel?.id ?? 'unknown',
              internalDescriptor: hidDevice,
              get: async () =>
                new LedgerDevice({
                  transportFactory,
                  descriptor,
                  walletPolicyAtom: this.#walletPolicyAtom,
                }),
            }
            return descriptor
          })
          descriptors.push(...usbDeviceList)
          break
        case 'bluetooth':
          const bluetoothDeviceList: HardwareWalletDescriptor[] = Object.values(
            this.#discoveredBluetoothDevices
          ).map((bluetoothDevice) => {
            const deviceModel = getInfosForServiceUuid(
              bluetoothDevice.serviceUUIDs?.[0] ?? ''
            )?.deviceModel

            const descriptor: HardwareWalletDescriptor = {
              name: bluetoothDevice.localName ?? deviceModel?.productName,
              manufacturer: 'ledger',
              transport: 'bluetooth',
              model: deviceModel?.id ?? 'unknown',
              internalDescriptor: bluetoothDevice,
              get: async () =>
                new LedgerDevice({
                  transportFactory,
                  descriptor,
                  walletPolicyAtom: this.#walletPolicyAtom,
                }),
            }
            return descriptor
          })
          descriptors.push(...bluetoothDeviceList)
          break
        case 'tcp':
          const descriptor: HardwareWalletDescriptor = {
            name: 'TCP Emulator',
            manufacturer: 'ledger',
            transport: 'tcp',
            model: 'unknown',
            internalDescriptor: { apduPort: APDU_PORT } as LedgerDescriptorTCP,
            get: async () =>
              new LedgerDevice({
                transportFactory,
                descriptor,
                walletPolicyAtom: this.#walletPolicyAtom,
              }),
          }
          descriptors.push(descriptor)
          break
        default:
          throw new UnknownTransportError(transportName)
      }
    }

    return descriptors
  }

  stop = async () => {
    this.#statusBluetooth?.unsubscribe()
  }
}

const createLedgerDiscovery = (deps: Dependencies) => new LedgerDiscovery({ ...deps })

export default {
  id: MODULE_ID,
  type: 'module',
  factory: createLedgerDiscovery,
  dependencies: [
    'config',
    'logger',
    'transportsFactories',
    'bluetoothStatusAtom',
    'bluetoothScanningAtom',
    'walletPolicyAtom',
  ],
  public: true,
} as const
