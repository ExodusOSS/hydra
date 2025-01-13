import type { WalletAccountNameToConnectedAssetNamesMap } from '../atoms/index.js'

export type HardwareWalletsState = {
  walletAccountNameToConnectedAssetNamesMap: WalletAccountNameToConnectedAssetNamesMap
}

const initialState: HardwareWalletsState = {
  walletAccountNameToConnectedAssetNamesMap: Object.create(null),
}

export default initialState
