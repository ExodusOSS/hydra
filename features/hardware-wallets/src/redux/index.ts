import id from './id.js'
import initialState, { type HardwareWalletsState } from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

const hardwareWalletsReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    hardwareWalletConnectedAssetNames: (state: HardwareWalletsState, payload: boolean) => ({
      ...state,
      walletAccountNameToConnectedAssetNamesMap: payload,
    }),
  },
  selectorDefinitions,
} as const

export default hardwareWalletsReduxDefinition
