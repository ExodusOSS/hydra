import type Transport from '@ledgerhq/hw-transport'

import type { TransportTypes } from '@exodus/hw-common'
import type { Subscription } from '@ledgerhq/hw-transport'

// Ledger's transport factory allow opening multiple devices
export type TransportFactory = typeof Transport
export type TransportFactories = Partial<Record<TransportTypes, TransportFactory>> & {
  bluetooth?: TransportFactory & {
    /** support checking if bluetooth is toggled on in settings */
    // @ledgerhq/hw-transport-web-ble
    observeAvailability?: (observer: {
      next: (available: boolean) => void
      error: (err: Error) => void
    }) => Subscription
    // @ledgerhq/react-native-hw-transport-ble
    observeState?: (observer: {
      next: (evt: { available: boolean }) => void
      error: (err: Error) => void
    }) => Subscription
  }
}

export type HwLedgerConfig = {
  bluetoothScannerTimeout: number
}
