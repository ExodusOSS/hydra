import { MY_STATE } from '@exodus/redux-dependency-injection'

import type { LedgerHardwareWalletState } from '../initial-state'

const resultFunction = (state: LedgerHardwareWalletState) => state.bluetoothStatus

const bluetoothStatusSelectorDefinition = {
  id: 'bluetoothStatus',
  resultFunction,
  dependencies: [{ selector: MY_STATE }],
} as const

export default bluetoothStatusSelectorDefinition
