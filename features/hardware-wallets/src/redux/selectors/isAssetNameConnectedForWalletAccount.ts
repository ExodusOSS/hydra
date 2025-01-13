import { MY_STATE } from '@exodus/redux-dependency-injection'
import { createSelector } from 'reselect'

import type { HardwareWalletsState } from '../initial-state.js'

type isAssetNameConnectedForWalletAccountParams = {
  walletAccountName: string
  assetName: string
}
const selectorFactory =
  (selfSelector: any) =>
  ({ walletAccountName, assetName }: isAssetNameConnectedForWalletAccountParams) =>
    createSelector(
      selfSelector,
      ({ walletAccountNameToConnectedAssetNamesMap }: HardwareWalletsState) =>
        walletAccountNameToConnectedAssetNamesMap[walletAccountName]?.includes(assetName) ?? false
    )

const isAssetNameConnectedForWalletAccountSelectorDefinition = {
  id: 'isAssetNameConnectedForWalletAccount',
  selectorFactory,
  dependencies: [{ selector: MY_STATE }],
} as const

export default isAssetNameConnectedForWalletAccountSelectorDefinition
