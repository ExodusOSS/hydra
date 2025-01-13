import id from './id'
import initialState, { type LedgerHardwareWalletState } from './initial-state'
import selectorDefinitions from './selectors'

const exchangeReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    bluetoothStatus: (state: LedgerHardwareWalletState, payload: boolean) => ({
      ...state,
      bluetoothStatus: payload,
    }),
    bluetoothScanning: (state: LedgerHardwareWalletState, payload: boolean) => ({
      ...state,
      bluetoothScanning: payload,
    }),
  },
  selectorDefinitions,
} as const

export default exchangeReduxDefinition
