import type { WalletAccountNameToConnectedAssetNamesMap } from '../atoms/index.js'
import type { SigningRequestState } from '../module/interfaces.js'

export type HardwareWalletsState = {
  walletAccountNameToConnectedAssetNamesMap: WalletAccountNameToConnectedAssetNamesMap
  signingRequests: SigningRequestState
}

const initialState: HardwareWalletsState = {
  walletAccountNameToConnectedAssetNamesMap: Object.create(null),
  signingRequests: Object.create(null),
}

export default initialState
