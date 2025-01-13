import { createAtomObserver } from '@exodus/atoms'

import type { Atom } from '@exodus/atoms'
import type { Port } from '../shared/types'
import type { Definition } from '@exodus/dependency-types'
import type { BluetoothStatus } from '../atoms'
import type { LedgerDiscovery } from '../module'

const createHardwareWalletLedgerPlugin = ({
  bluetoothStatusAtom,
  bluetoothScanningAtom,
  ledgerDiscovery,
  port,
}: {
  bluetoothStatusAtom: Atom<BluetoothStatus>
  bluetoothScanningAtom: Atom<boolean>
  ledgerDiscovery: LedgerDiscovery
  port: Port
}) => {
  const observers = [
    createAtomObserver({ atom: bluetoothStatusAtom, port, event: 'bluetoothStatus' }),
    createAtomObserver({ atom: bluetoothScanningAtom, port, event: 'bluetoothScanning' }),
  ]
  observers.forEach((observer) => observer.register())

  const start = () => {
    observers.forEach((observer) => observer.start())
  }

  const stop = () => {
    observers.forEach((observer) => observer.unregister())
    ledgerDiscovery.stop()
  }

  const onUnlock = () => {
    start()
  }

  const onLoad = () => {
    start()
  }

  const onStop = () => {
    stop()
  }

  return { onUnlock, onLoad, onStop }
}

const hardwareWalletLedgerPluginDefinition = {
  id: 'hardwareWalletLedgerPlugin',
  type: 'plugin',
  factory: createHardwareWalletLedgerPlugin,
  dependencies: ['bluetoothStatusAtom', 'bluetoothScanningAtom', 'ledgerDiscovery', 'port'],
  public: true,
} as const satisfies Definition

export default hardwareWalletLedgerPluginDefinition
