import type { SigningRequestState } from '../module/interfaces.js'
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
    hardwareWalletSigningRequests: (state: HardwareWalletsState, payload: SigningRequestState) => ({
      ...state,
      signingRequests: payload,
    }),
  },
  selectorDefinitions,
} as const

export default hardwareWalletsReduxDefinition
