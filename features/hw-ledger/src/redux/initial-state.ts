import type { BluetoothStatus } from '../atoms'

export type LedgerHardwareWalletState = {
  bluetoothStatus: BluetoothStatus
  bluetoothScanning: boolean
}

const initialState: LedgerHardwareWalletState = {
  bluetoothStatus: { type: 'Unknown', available: false },
  bluetoothScanning: false,
}

export default initialState
