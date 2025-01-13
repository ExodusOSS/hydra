import { MY_STATE } from '@exodus/redux-dependency-injection'

import type { LedgerHardwareWalletState } from '../initial-state'

const resultFunction = (state: LedgerHardwareWalletState) => state.bluetoothScanning

const bluetoothScanningSelectorDefinition = {
  id: 'bluetoothScanning',
  resultFunction,
  dependencies: [{ selector: MY_STATE }],
} as const

export default bluetoothScanningSelectorDefinition
