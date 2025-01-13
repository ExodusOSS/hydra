import { memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'

const EMPTY = new Set<string>()

type AvailableAssetNamesByWalletAccountSelector = (state: any) => Record<string, Set<string>>
type EnabledAssetsSelector = (state: any) => Record<string, boolean>

const selectorFactory = (
  availableAssetNamesByWalletAccountSelector: AvailableAssetNamesByWalletAccountSelector,
  enabledAssetsSelector: EnabledAssetsSelector
) =>
  memoize((walletAccount: string) =>
    createSelector(
      availableAssetNamesByWalletAccountSelector,
      enabledAssetsSelector,
      (availableAssetsByWalletAccount, enabledAssets): Set<string> => {
        const availableAssets = availableAssetsByWalletAccount[walletAccount]
        if (!availableAssets) return EMPTY

        return new Set([...availableAssets].filter((asset) => enabledAssets[asset]))
      }
    )
  )

const createEnabledAssetsByWalletAccountSelectorDefinition = {
  id: 'createEnabledAssetsByWalletAccount',
  selectorFactory,
  dependencies: [
    { selector: 'availableAssetNamesByWalletAccount' },
    { module: 'enabledAssets', selector: 'data' },
  ],
} as const

export default createEnabledAssetsByWalletAccountSelectorDefinition
